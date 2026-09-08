import { Meta, StoryObj } from "@storybook/nextjs";
// import { expect, within } from "storybook/test";
import { MuiTest } from "./MuiTest";

const meta: Meta<typeof MuiTest> = {
  component: MuiTest,
  tags: ["autodocs"],
  args: {},
};
export default meta;

export const Primary: StoryObj<typeof MuiTest> = {
  args: {},
  play: async ({ canvasElement }) => {
    // const canvas = within(canvasElement);
    // expect(canvas.getByText("Test")).toBeInTheDocument();
  },
};
