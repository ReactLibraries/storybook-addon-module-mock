import React, { useState } from 'react';
import { JSONTree } from 'react-json-tree';
import { TabWrapper } from 'storybook/internal/components';
import { addons, types, useChannel } from 'storybook/manager-api';
import { ADDON_ID, TAB_ID } from './types.js';
import type { Addon_RenderOptions } from 'storybook/internal/types';
import type { MockInstance } from 'storybook/test';

const theme = {
  scheme: 'custom',
  base00: '#ffffff',
  base01: '#aeb8c4', // keyの色
  base02: '#9b9b9b', // テキスト色
  base03: '#9b9a9a', // 配列/オブジェクトの区切り線の色
  base04: '#909090',
  base05: '#1e1e1e', // テキストの色
  base06: '#efefef', // 配列/オブジェクトの背景色
  base07: '#9e9e9e',
  base08: '#f44336',
  base09: '#ff9800',
  base0A: '#ffeb3b',
  base0B: '#4caf50',
  base0C: '#00bcd4',
  base0D: '#2196f3',
  base0E: '#9c27b0',
  base0F: '#673ab7',
};

const Panel = () => {
  const [mocks, setMocks] = useState<[string, MockInstance['mock']][] | undefined>(undefined);
  useChannel({
    [ADDON_ID]: (mocks) => {
      setMocks(mocks);
    },
  });

  return (
    <div>
      {mocks &&
        mocks.map(([name, mock], index) => (
          <div key={name + index}>
            <div style={{ padding: '4px 4px 0', color: 'green' }}>{name}</div>
            <div style={{ padding: '0 4px', color: 'blue', marginTop: '-4px' }}>
              <JSONTree data={mock} theme={theme} />
            </div>
            <hr />
          </div>
        ))}
    </div>
  );
};

const render = ({ active }: Partial<Addon_RenderOptions>) => (
  <TabWrapper active={!!active}>
    <Panel />
  </TabWrapper>
);

addons.register(ADDON_ID, (api) => {
  const property: { count: number; setCount?: (count: number) => void } = { count: 0 };
  const addPanel = () =>
    addons.add(TAB_ID, {
      type: types.PANEL,
      title: () => {
        const [count, setCount] = useState(property.count);
        property.setCount = setCount;
        return <>Mocks{count ? `(${count})` : ''}</>;
      },
      render,
    });
  api.on(ADDON_ID, (mocks) => {
    property.count = mocks.length;
    property.setCount?.(property.count);
  });
  addPanel();
});
