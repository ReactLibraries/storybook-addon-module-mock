import Link from "next/link";
import React, { FC } from "react";

interface Props {}

/**
 * NextHook
 *
 * @param {Props} { }
 */
export const NextHook: FC<Props> = ({}) => {
  return (
    <div>
      <Link href="/">Before</Link>
    </div>
  );
};
