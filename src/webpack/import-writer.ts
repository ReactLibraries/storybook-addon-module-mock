import { Compiler } from 'webpack';

export class ImportWriterPlugiun {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('ImportWriter', (compilation) => {
      compilation.mainTemplate.hooks.require.tap('ImportWriter', (source: string) => {
        return source.replace(
          /return module\.exports;/g,
          `
        if (Object.prototype.toString.call(module.exports) === '[object Module]'){
          module.exports = Object.assign({}, module.exports);
          __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
        }
        return module.exports;`
        );
      });
    });
  }
}
