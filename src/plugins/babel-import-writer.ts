import { types as t, PluginObj, template } from '@babel/core';

const buildMocks = template(`
  const MOCKS = {};
  export const $$mock$$ = (name, value) => MOCKS[name](value);
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
};

const plugin = (): PluginObj<PluginState> => {
  return {
    name: 'mocks',
    visitor: {
      Program: {
        enter(_, state) {
          state.moduleExports = [];
        },
        exit(path, { moduleExports }) {
          const mocks = path.scope.generateDeclaredUidIdentifier('mocks');
          path.pushContainer('body', buildMocks({ MOCKS: mocks }));
          moduleExports.forEach(([name, local]) => {
            const mock = buildMock({
              NAME: t.stringLiteral(name),
              LOCAL: t.identifier(local),
              MOCKS: mocks,
            });
            path.pushContainer('body', mock);
          });
        },
      },
      ExportNamedDeclaration(path, { moduleExports }) {
        const identifiers = path.getOuterBindingIdentifiers();
        moduleExports.push(
          ...Object.keys(identifiers).map<[string, string]>((name) => [name, name])
        );
      },
      ExportDefaultDeclaration(path, { moduleExports }) {
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
      },
    },
  };
};

export default plugin;
