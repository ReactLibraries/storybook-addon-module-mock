import { TransformOptions } from '@babel/core';
import { ImportWriterPlugin } from './plugins/webpack-import-writer.js';
import type { AddonOptions } from './types.js';
import type { Options } from '@storybook/types';
import type { Configuration } from 'webpack';

export const babel = async (
  config: TransformOptions,
  options: Options & AddonOptions
): Promise<TransformOptions> => {
  if (options.configType !== 'PRODUCTION') return config;
  const { include, exclude } = options;
  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      [require.resolve('./plugins/babel-import-writer'), { include, exclude }],
    ],
  };
};

export async function webpackFinal(config: Configuration) {
  config.plugins = [...(config.plugins ?? []), new ImportWriterPlugin()];
  return config;
}
