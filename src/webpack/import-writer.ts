import { Compiler } from 'webpack';

export class ImportWriterPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('ImportWriter', (compilation) => {
      compilation.mainTemplate.hooks.require.tap('ImportWriter', (source) => {
        return source.replace(
          /return module\.exports;/g,
          `
        if (Object.prototype.toString.call(module.exports) === '[object Module]'){
          module.exports = Object.assign({}, module.exports);
        }
        return module.exports;
      `
        );
      });
    });
  }
}
