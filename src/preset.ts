import { TransformOptions } from '@babel/core';
import { StorybookConfig } from '@storybook/core-common';
import { Configuration } from 'webpack';
import { ImportWriterPlugin } from './plugins/webpack-import-writer';

export const managerEntries = (entry: string[] = []): string[] => [
  ...entry,
  require.resolve('./register'),
];

export const babel = async (config: TransformOptions): Promise<TransformOptions> => {
  if (process.env.NODE_ENV === 'development') return config;
  return {
    ...config,
    plugins: [...(config.plugins ?? []), require.resolve('./plugins/babel-import-writer')],
  };
};

export async function webpackFinal(config: Configuration) {
  config.plugins = [...(config.plugins ?? []), new ImportWriterPlugin()];
  return config;
}

export const config: StorybookConfig['previewAnnotations'] = (entry = []) => [
  ...entry,
  require.resolve('./preview'),
];
