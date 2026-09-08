import { Meta, StoryObj } from "@storybook/nextjs";
import { expect, waitFor, within } from "storybook/test";
import { createMock, getMock, render } from "storybook-addon-module-mock";
import * as message from "./message";
import { ReRender } from "./ReRender";

const meta: Meta<typeof ReRender> = {
  tags: ["autodocs"],
  component: ReRender,
};
export default meta;

export const Primary: StoryObj<typeof ReRender> = {};

export const ReRenderTest: StoryObj<typeof ReRender> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(message, "getMessage");
        return [mock];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const mock = getMock(parameters, message, "getMessage");
    mock.mockReturnValue("Test1");
    render(parameters);
    await waitFor(() => {
      expect(canvas.getByText("Test1")).toBeInTheDocument();
    });
    mock.mockReturnValue("Test2");
    render(parameters);
    await waitFor(() => {
      expect(canvas.getByText("Test2")).toBeInTheDocument();
    });
  },
};
