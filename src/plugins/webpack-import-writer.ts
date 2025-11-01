import { Compiler } from 'webpack';
import { AddonOptions } from '../types.js';

export class ImportWriterPlugin {
  constructor(private options?: AddonOptions) {}
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('ImportWriter', (compilation) => {
      compilation.mainTemplate.hooks.require.tap('ImportWriter', (source: string) => {
        const s = source.replace(
          /return module\.exports;/g,
          `
        function minimatch(str,pattern) {
            function escapeRegExp(string) {
                return string.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$$&');
            }
            let regexPattern = pattern
                .split('**').map(part => part.split('*').map(escapeRegExp).join('[^/]*')).join('.*');
            let regex = new RegExp('^' + regexPattern + '$$');
            return regex.test(str);
        }
        const isTarget = (fileName, options) => {
          if (!options) return true;
          const { include, exclude } = options;
          if (!fileName) return true;

          if (
            include &&
            include.some((i) => (i instanceof RegExp ? i.test(fileName) : minimatch(fileName, i)))
          )
            return true;
          if (
            exclude &&
            exclude.some((i) => (i instanceof RegExp ? i.test(fileName) : minimatch(fileName, i)))
          )
            return false;
          return true;
        };

        if (Object.prototype.toString.call(module.exports) === '[object Module]' &&
          isTarget(moduleId, ${JSON.stringify(this.options)}) 
        ) {
          class Module {
            [Symbol.toStringTag] = 'Module';
          }
          Module.prototype.__moduleId__ = moduleId;
          module.exports = Object.assign(new Module(), module.exports);
        }
        return module.exports;
        `
        );
        return s;
      });
    });
  }
}
