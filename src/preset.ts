import { Options } from 'storybook/internal/types';
import { ImportWriterPlugin } from './plugins/webpack-import-writer.js';
import { AddonOptions } from './types.js';
import type { Configuration } from 'webpack';

export const managerEntries = (entry: string[] = []): string[] => [
  ...entry,
  require.resolve('./manager'),
];

export async function webpack(config: Configuration, options: Options & AddonOptions) {
  config.optimization = {
    ...config.optimization,
    concatenateModules: false,
  };
  const { include, exclude } = options;
  config.plugins = [...(config.plugins ?? []), new ImportWriterPlugin({ include, exclude })];
  return config;
}
