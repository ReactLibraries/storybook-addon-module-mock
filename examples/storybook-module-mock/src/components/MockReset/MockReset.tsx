import React, { FC } from "react";
import { action1, action2 } from "./action";

interface Props {}

/**
 * MockReset
 *
 * @param {Props} { }
 */
export const MockReset: FC<Props> = ({}) => {
  return (
    <div>
      <button onClick={action1}>Button1</button>
      <button onClick={action2}>Button2</button>
    </div>
  );
};
