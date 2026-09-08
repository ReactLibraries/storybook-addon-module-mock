import { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createMock, getMock, resetMock } from "storybook-addon-module-mock";
import * as action from "./action";
import { MockReset } from "./MockReset";

const meta: Meta<typeof MockReset> = {
  tags: ["autodocs"],
  component: MockReset,
};
export default meta;

export const Primary: StoryObj<typeof MockReset> = {
  parameters: {
    moduleMock: {
      mock: () => {
        // The mock to be used is created here
        const mock1 = createMock(action, "action1");
        const mock2 = createMock(action, "action2");
        return [mock1, mock2];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const mock1 = getMock(parameters, action, "action1");
    const mock2 = getMock(parameters, action, "action2");

    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(mock1).not.toBeCalled();
      expect(mock2).not.toBeCalled();
    });
    userEvent.click(await canvas.findByText("Button1"));
    await waitFor(() => {
      expect(mock1).toBeCalled();
      expect(mock2).not.toBeCalled();
    });

    // Reset all mock
    resetMock(parameters);
    await waitFor(() => {
      expect(mock1).not.toBeCalled();
      expect(mock2).not.toBeCalled();
    });

    userEvent.click(await canvas.findByText("Button2"));
    await waitFor(() => {
      expect(mock1).not.toBeCalled();
      expect(mock2).toBeCalled();
    });
  },
};
