import { ImportWriterPlugin } from './plugins/webpack-import-writer.js';
import type { Configuration } from 'webpack';

export const managerEntries = (entry: string[] = []): string[] => [
  ...entry,
  require.resolve('./manager'),
];

export async function webpack(config: Configuration) {
  config.optimization = {
    ...config.optimization,
    concatenateModules: false,
  };
  config.plugins = [...(config.plugins ?? []), new ImportWriterPlugin()];
  return config;
}
