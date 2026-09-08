import { Meta, StoryObj } from "@storybook/nextjs";
import { expect, waitFor, within } from "storybook/test";
import { render } from "storybook-addon-module-mock";
import { ReRenderArgs } from "./ReRenderArgs";

const meta: Meta<typeof ReRenderArgs> = {
  tags: ["autodocs"],
  component: ReRenderArgs,
  args: { value: "Test" },
};
export default meta;

export const Primary: StoryObj<typeof ReRenderArgs> = {
  args: {},
  play: async ({ canvasElement, parameters, step }) => {
    const canvas = within(canvasElement);

    await step("first props", async () => {
      expect(canvas.getByText("Test")).toBeInTheDocument();
    });

    await step("Re-render with new props", async () => {
      // Re-render with new props
      render(parameters, { value: "Test2" });
      await waitFor(() => {
        expect(canvas.getByText("Test2")).toBeInTheDocument();
      });

      // Re-render with new props
      render(parameters, { value: "Test3" });
      await waitFor(() => {
        expect(canvas.getByText("Test3")).toBeInTheDocument();
      });

      // Re-render with new props
      render(parameters, { value: "Test4" });
      await waitFor(() => {
        expect(canvas.getByText("Test4")).toBeInTheDocument();
      });
    });
  },
};
