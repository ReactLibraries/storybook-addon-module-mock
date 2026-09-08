import webpack, { Compiler } from 'webpack';
import { AddonOptions } from '../types.js';

/**
 * Generates runtime code that intercepts module.exports to allow Storybook module mocking.
 */
const createMockInterceptor = (options?: AddonOptions): string => {
  const optionsJson = JSON.stringify(options ?? {});

  return `
        function minimatch(str, pattern) {
          function escapeRegExp(string) {
            return string.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$$&');
          }
          let regexPattern = pattern
            .split('**')
            .map((part) => part.split('*').map(escapeRegExp).join('[^/]*'))
            .join('.*');
          let regex = new RegExp('^' + regexPattern + '$$');
          return regex.test(str);
        }

        const isTarget = (fileName, options) => {
          if (!options) return true;
          const { include, exclude } = options;
          if (!fileName) return true;

          if (
            include &&
            include.some((i) => (typeof i === 'string' ? minimatch(fileName, i) : new RegExp(i).test(fileName)))
          )
            return true;
          if (
            exclude &&
            exclude.some((i) => (typeof i === 'string' ? minimatch(fileName, i) : new RegExp(i).test(fileName)))
          )
            return false;
          return true;
        };

        if (
          Object.prototype.toString.call(module.exports) === '[object Module]' &&
          isTarget(moduleId, ${optionsJson})
        ) {
          class Module {
            [Symbol.toStringTag] = 'Module';
          }
          Module.prototype.__moduleId__ = moduleId;
          module.exports = Object.assign(new Module(), module.exports);
        }
        return module.exports;
  `;
};

export class ImportWriterPlugin {
  constructor(private options?: AddonOptions) {}

  apply(compiler: Compiler) {
    const { JavascriptModulesPlugin } = compiler.webpack?.javascript ?? webpack.javascript;

    compiler.hooks.compilation.tap('ImportWriterPlugin', (compilation) => {
      const hooks = JavascriptModulesPlugin.getCompilationHooks(compilation);
      hooks.renderRequire.tap('ImportWriterPlugin', (source: string) => {
        return source.replace(/return module\.exports;/g, createMockInterceptor(this.options));
      });
    });
  }
}
