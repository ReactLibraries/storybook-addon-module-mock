import React, { FC, useMemo, useState } from "react";
interface Props {}

/**
 * MockTest
 *
 * @param {Props} { }
 */
export const MockTest: FC<Props> = ({}) => {
  const [, reload] = useState({});
  const value = useMemo(() => {
    return "Before";
  }, []);
  return (
    <div>
      <button onClick={() => reload({})}>{value}</button>
    </div>
  );
};
