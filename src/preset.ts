import { StorybookConfig } from "@storybook/core-common";
import { TransformOptions } from "@babel/core";

export const managerEntries = (entry: string[] = []): string[] => [
  ...entry,
  require.resolve("./register"),
];

export const babel = async (
  config: TransformOptions
): Promise<TransformOptions> => {
  return {
    ...config,
    plugins: [...(config.plugins ?? []), require.resolve("./babel-plugin")],
  };
};

export const config: StorybookConfig["previewAnnotations"] = (entry = []) => [
  ...entry,
  require.resolve("./preview"),
];
