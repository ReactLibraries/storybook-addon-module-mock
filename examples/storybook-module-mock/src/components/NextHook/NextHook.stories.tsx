import { Meta, StoryObj } from "@storybook/nextjs";
import * as link from "next/link";
import { expect, within } from "storybook/test";
import { createMock, getMock } from "storybook-addon-module-mock";
import { NextHook } from "./NextHook";

const meta: Meta<typeof NextHook> = {
  tags: ["autodocs"],
  component: NextHook,
  parameters: {
    //  nextRouter: { asPath: '/' },
  },
  args: {},
};
export default meta;

export const Primary: StoryObj<typeof NextHook> = {};

export const Mock: StoryObj<typeof NextHook> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(link);
        mock.mockReturnValue(<div>After</div>);
        return [mock];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("After")).toBeInTheDocument();
    const mock = getMock(parameters, link);
    expect(mock).toBeCalled();
  },
};
