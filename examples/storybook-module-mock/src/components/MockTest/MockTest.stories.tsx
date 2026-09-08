import { Meta, StoryObj } from "@storybook/nextjs";
import React, { DependencyList } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { createMock, getMock, getOriginal } from "storybook-addon-module-mock";
import { MockTest } from "./MockTest";

const meta: Meta<typeof MockTest> = {
  tags: ["autodocs"],
  component: MockTest,
};
export default meta;

export const Primary: StoryObj<typeof MockTest> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Before")).toBeInTheDocument();
  },
};

export const Mock: StoryObj<typeof MockTest> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(React, "useMemo");
        mock.mockImplementation((fn: () => unknown, deps: DependencyList) => {
          // Call the original useMemo
          const value = getOriginal(mock)(fn, deps);
          // Change the return value under certain conditions
          return value === "Before" ? "After" : value;
        });
        return [mock];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("After")).toBeInTheDocument();
    const mock = getMock(parameters, React, "useMemo");
    expect(mock).toBeCalled();
  },
};

export const Action: StoryObj<typeof MockTest> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const useMemo = React.useMemo;
        const mock = createMock(React, "useMemo");
        mock.mockImplementation(useMemo);
        return [mock];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const mock = getMock(parameters, React, "useMemo");
    mock.mockImplementation((fn: () => unknown, deps: DependencyList) => {
      const value = getOriginal(mock)(fn, deps);
      return value === "Before" ? "Action" : value;
    });
    userEvent.click(await canvas.findByRole("button"));
    await waitFor(() => {
      expect(canvas.getByText("Action")).toBeInTheDocument();
    });
  },
};
