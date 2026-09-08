import React, { FC, useState } from "react";
import { getMessage } from "./message";

interface Props {}

/**
 * LibHook
 *
 * @param {Props} { }
 */
export const LibHook: FC<Props> = ({}) => {
  const [, reload] = useState({});
  const value = getMessage();
  return (
    <div>
      <button onClick={() => reload({})}>{value}</button>
    </div>
  );
};
