import { Meta, StoryObj } from "@storybook/nextjs";
import { expect, userEvent, within } from "storybook/test";
import { createMock, getMock } from "storybook-addon-module-mock";
import { FormMock } from "./FormMock";
import * as login from "./login";

const meta: Meta<typeof FormMock> = {
  component: FormMock,
  parameters: {},
  args: {},
};
export default meta;

export const Primary: StoryObj<typeof FormMock> = {};

export const Submit: StoryObj<typeof FormMock> = {
  tags: ["autodocs"],
  args: {},
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(login);
        return mock;
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const mock = getMock(parameters, login);
    const canvas = within(canvasElement);
    const userInput = await canvas.findByLabelText("User:");
    const passwordInput = await canvas.findByLabelText("Password:");
    await userEvent.type(userInput, "User");
    await userEvent.type(passwordInput, "Password");
    await userEvent.click(await canvas.findByText("Submit"));
    expect(mock.mock.lastCall).toStrictEqual(["User", "Password"]);
  },
};
