import React, { FC } from "react";
import { getMessage } from "./message";

interface Props {}

/**
 * ReRender
 *
 * @param {Props} { }
 */
export const ReRender: FC<Props> = ({}) => {
  const value = getMessage();
  return <div>{value}</div>;
};
