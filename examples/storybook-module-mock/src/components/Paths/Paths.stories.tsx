import { Meta, StoryObj } from "@storybook/react";
import { createMock } from "storybook-addon-module-mock";
import { Paths } from "./Paths";
// "@/*": ["./src/*"]
import * as message from "@/components/Paths/message";

const meta: Meta<typeof Paths> = {
  tags: ["autodocs"],
  component: Paths,
};
export default meta;

export const Primary: StoryObj<typeof Paths> = {};

export const PathMock: StoryObj<typeof Paths> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(message, "getMessage");
        mock.mockReturnValue("MockTest");
        return [mock];
      },
    },
  },
};
