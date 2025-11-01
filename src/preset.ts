import { fileURLToPath } from 'url';
import { Options } from 'storybook/internal/types';
import { ImportWriterPlugin } from './plugins/webpack-import-writer.js';
import { AddonOptions } from './types.js';
import type { Configuration } from 'webpack';

export const managerEntries = (entry: string[] = []): string[] => [
  ...entry,
  fileURLToPath(import.meta.resolve('./manager.js', import.meta.url)),
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
