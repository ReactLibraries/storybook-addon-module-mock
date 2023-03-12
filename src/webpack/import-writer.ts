import { Compiler } from 'webpack';

export class ImportWriterPlugiun {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('ImportWriter', (compilation) => {
      compilation.mainTemplate.hooks.require.tap('Resolve', (source: string) => {
        return source.replace(
          /return module\.exports;/g,
          `
try{
  if(String(module.exports)==='[object Module]')
    module.exports = Object.assign( {},module.exports);
}catch(_){}
return module.exports;
`
        );
      });
    });
  }
}
