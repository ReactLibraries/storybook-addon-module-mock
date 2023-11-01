import { types as t, PluginObj, template, NodePath } from '@babel/core';
import { minimatch } from 'minimatch';
import { AddonOptions } from '../types';

const buildMocks = template(`
  const MOCKS = {};
  export const $$mock$$ = (name, value) => {
    if(typeof MOCKS[name] !== "function")
      throw new Error("Exported function not found.");
    return MOCKS[name](value);
  }
`);

const buildMock = template(`
  MOCKS[NAME] = function ($$value$$) {
    const $$temp$$ = LOCAL;
    LOCAL = $$value$$;
    return $$temp$$;
  };
`);

type PluginState = {
  moduleExports: [string, string][];
  isTarget: boolean;
};

const isModuleExports = (path: NodePath<t.Program>) => {
  let hasModuleExports = false;
  path.traverse({
    Identifier(idPath) {
      if (
        idPath.node.name === 'module' &&
        (idPath.parentPath.node as { property: { name: string } }).property.name === 'exports'
      ) {
        hasModuleExports = true;
      }
    },
  });
  return hasModuleExports;
};

const isTarget = (fileName: string | undefined, options: AddonOptions) => {
  const { include, exclude } = options;
  if (!fileName) return true;
  const isTarget =
    include?.some((i) => (i instanceof RegExp ? i.test(fileName) : minimatch(fileName, i))) ?? true;
  if (!isTarget || !exclude) return isTarget;
  return !exclude.some((i) => (i instanceof RegExp ? i.test(fileName) : minimatch(fileName, i)));
};

const getFileName = (path: NodePath<t.Program>) => {
  return (path.hub as (typeof path)['hub'] & { file: { opts: { filename: string } } }).file.opts
    .filename;
};

const plugin = (_: unknown, options: AddonOptions): PluginObj<PluginState> => {
  return {
    name: 'mocks',
    visitor: {
      Program: {
        enter(path, state) {
          const fileName = getFileName(path);
          state.isTarget = isTarget(fileName, options);
          state.moduleExports = [];
        },
        exit(path, { isTarget: isEnable, moduleExports }) {
          if (isEnable && !isModuleExports(path)) {
            const mocks = path.scope.generateDeclaredUidIdentifier('$$mocks$$');
            path.pushContainer('body', buildMocks({ MOCKS: mocks }));
            moduleExports.forEach(([name, local]) => {
              const mock = buildMock({
                NAME: t.stringLiteral(name),
                LOCAL: t.identifier(local),
                MOCKS: mocks,
              });
              path.pushContainer('body', mock);
            });
          }
        },
      },
      ExportNamedDeclaration(path, { isTarget: isEnable, moduleExports }) {
        if (isEnable) {
          const identifiers = path.getOuterBindingIdentifiers();
          moduleExports.push(
            ...Object.keys(identifiers).map<[string, string]>((name) => [name, name])
          );
        }
      },
      ExportDefaultDeclaration(path, { isTarget: isEnable, moduleExports }) {
        if (isEnable) {
          const declaration = path.node.declaration;
          const name = t.isIdentifier(declaration) && declaration.name;
          if (!name) {
            if (t.isArrowFunctionExpression(declaration)) {
              const id = path.scope.generateUidIdentifier('default');
              const variableDeclaration = t.variableDeclaration('const', [
                t.variableDeclarator(id, declaration),
              ]);
              path.replaceWith(t.exportDefaultDeclaration(id));
              path.insertBefore(variableDeclaration);
              moduleExports.push(['default', id.name]);
            }
          } else {
            const decl = t.exportNamedDeclaration(null, [
              t.exportSpecifier(t.identifier(name), t.identifier('default')),
            ]);
            path.replaceWith(decl);
            moduleExports.push(['default', name]);
          }
        }
      },
    },
  };
};

export default plugin;
