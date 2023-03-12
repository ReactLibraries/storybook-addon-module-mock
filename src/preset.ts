import { StorybookConfig } from '@storybook/core-common';
import { Configuration } from 'webpack';
import { ImportWriterPlugiun } from './webpack/import-writer';

export const managerEntries = (entry: string[] = []): string[] => [
  ...entry,
  require.resolve('./register'),
];

export async function webpackFinal(config: Configuration) {
  config.plugins = [...(config.plugins ?? []), new ImportWriterPlugiun()];
  return config;
}

export const config: StorybookConfig['previewAnnotations'] = (entry = []) => [
  ...entry,
  require.resolve('./preview'),
];
