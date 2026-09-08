import React, { FC } from "react";
import styled from "./ReRenderArgs.module.scss";

interface Props {
  value: string;
}

/**
 * ReRenderArgs
 *
 * @param {Props} { value: string }
 */
export const ReRenderArgs: FC<Props> = ({ value }) => {
  return <div className={styled.root}>{value}</div>;
};
