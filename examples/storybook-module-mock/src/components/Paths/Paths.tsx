import React, { FC } from "react";
// "@/*": ["./src/*"]
import { getMessage } from "@/components/Paths/message";

interface Props {}

/**
 * ReRender
 *
 * @param {Props} { }
 */
export const Paths: FC<Props> = ({}) => {
  const value = getMessage();
  return <div>{value}</div>;
};
