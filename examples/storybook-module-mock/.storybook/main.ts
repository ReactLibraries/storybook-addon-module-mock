import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  stories: ["../src/**/*.stories.@(tsx)"],
  addons: [
    {
      name: "@storybook/addon-coverage",
      options: {
        istanbul: {
          exclude: ["**/components/**/index.ts"],
        },
      },
    },
    {
      name: "storybook-addon-module-mock",
      options: {
        exclude: ["**/node_modules/@mui/**"],
      },
    },
  ],
};

export default config;
