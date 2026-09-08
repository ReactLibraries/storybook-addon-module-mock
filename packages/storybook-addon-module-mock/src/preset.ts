import { fileURLToPath } from 'url';
import { Options } from 'storybook/internal/types';
import { AddonOptions } from './types.js';
import { ImportWriterPlugin } from './webpack/ImportWriterPlugin.js';
import type { Configuration } from 'webpack';

export const managerEntries = (entry: string[] = []): string[] => [
  ...entry,
  fileURLToPath(import.meta.resolve('./manager.js', import.meta.url)),
];

export async function webpack(config: Configuration, options: Options & AddonOptions): Promise<Configuration> {
  // Disable module concatenation so that individual module exports can be intercepted by ImportWriterPlugin
  config.optimization = {
    ...config.optimization,
    concatenateModules: false,
  };

  const { include, exclude } = options;
  config.plugins = [...(config.plugins ?? []), new ImportWriterPlugin({ include, exclude })];
  return config;
}
