import { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createMock, getMock } from "storybook-addon-module-mock";
import { LibHook } from "./LibHook";
import * as message from "./message";

const meta: Meta<typeof LibHook> = {
  tags: ["autodocs"],
  component: LibHook,
};
export default meta;

export const Primary: StoryObj<typeof LibHook> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Before")).toBeInTheDocument();
  },
};

export const Mock: StoryObj<typeof LibHook> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(message, "getMessage");
        mock.mockReturnValue("After");
        return [mock];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("After")).toBeInTheDocument();
    const mock = getMock(parameters, message, "getMessage");
    console.log(mock);
    expect(mock).toBeCalled();
  },
};

export const Action: StoryObj<typeof LibHook> = {
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
    mock.mockReturnValue("Action");
    userEvent.click(await canvas.findByRole("button"));
    await waitFor(() => {
      expect(canvas.getByText("Action")).toBeInTheDocument();
    });
  },
};
