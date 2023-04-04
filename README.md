# storybook-addon-module-mock

Provides module mocking functionality like `jest.mock` on Storybook.

![](https://raw.githubusercontent.com/ReactLibraries/storybook-addon-module-mock/master/document/image/image01.png)

## usage

Added 'storybook-addon-module-mock' to Storybook addons.

- Sample code  
  https://github.com/SoraKumo001/storybook-module-mock

### Storybook@6 & Next.js

- .storybook/main.js

```js
// @ts-check
/**
 * @type { import("@storybook/react/types").StorybookConfig}
 */
module.exports = {
  core: {
    builder: 'webpack5',
  },
  stories: ['../src/**/*.stories.@(tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: '@storybook/addon-coverage',
      options: {
        istanbul: {
          exclude: ['**/components/**/index.ts'],
        },
      },
    },
    'storybook-addon-next',
    'storybook-addon-module-mock',
  ],
  features: {
    storyStoreV7: true,
    interactionsDebugger: true,
  },
  typescript: { reactDocgen: 'react-docgen' },
};
```

### Storybook@7 & Next.js

- .storybook/main.ts

```ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  stories: ['../src/**/*.stories.@(tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    {
      name: '@storybook/addon-coverage',
      options: {
        istanbul: {
          exclude: ['**/components/**/index.ts'],
        },
      },
    },
    'storybook-addon-module-mock',
  ],
  features: {
    storyStoreV7: true,
  },
  typescript: {
    reactDocgen: 'react-docgen',
  },
};

export default config;
```

### Sample1

#### MockTest.tsx

```tsx
import React, { FC, useMemo, useState } from 'react';

interface Props {}

/**
 * MockTest
 *
 * @param {Props} { }
 */
export const MockTest: FC<Props> = ({}) => {
  const [, reload] = useState({});
  const value = useMemo(() => {
    return 'Before';
  }, []);
  return (
    <div>
      <button onClick={() => reload({})}>{value}</button>
    </div>
  );
};
```

#### MockTest.stories.tsx

`createMock` replaces the target module function with the return value of `jest.fn()`.  
The `mockRestore()` is automatically performed after the Story display is finished.

```tsx
import { expect } from '@storybook/jest';
import { userEvent, waitFor, within } from '@storybook/testing-library';
import { createMock, getMock } from 'storybook-addon-module-mock';
import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { MockTest } from './MockTest';
import React from 'react';

const meta: ComponentMeta<typeof MockTest> = {
  title: 'Components/MockTest',
  component: MockTest,
};
export default meta;

export const Primary: ComponentStoryObj<typeof MockTest> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Before')).toBeInTheDocument();
  },
};

export const Mock: ComponentStoryObj<typeof MockTest> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(React, 'useMemo');
        mock.mockReturnValue('After');
        return [mock];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('After')).toBeInTheDocument();
    const mock = getMock(parameters, React, 'useMemo');
    expect(mock).toBeCalled();
  },
};

export const Action: ComponentStoryObj<typeof MockTest> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(React, 'useMemo');
        return [mock];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const mock = getMock(parameters, React, 'useMemo');
    mock.mockReturnValue('Action');
    userEvent.click(await canvas.findByRole('button'));
    await waitFor(() => {
      expect(canvas.getByText('Action')).toBeInTheDocument();
    });
  },
};
```

### Sample2

#### message.ts

```tsx
export const getMessage = () => {
  return 'Before';
};
```

#### LibHook.tsx

```tsx
import React, { FC, useState } from 'react';
import { getMessage } from './message';

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
```

#### LibHook.stories.tsx

```tsx
import { expect } from '@storybook/jest';
import { userEvent, waitFor, within } from '@storybook/testing-library';
import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { LibHook } from './LibHook';
import { createMock, getMock } from 'storybook-addon-module-mock';
import * as message from './message';

const meta: ComponentMeta<typeof LibHook> = {
  title: 'Components/LibHook',
  component: LibHook,
};
export default meta;

export const Primary: ComponentStoryObj<typeof LibHook> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Before')).toBeInTheDocument();
  },
};

export const Mock: ComponentStoryObj<typeof LibHook> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(message, 'getMessage');
        mock.mockReturnValue('After');
        return [mock];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('After')).toBeInTheDocument();
    const mock = getMock(parameters, message, 'getMessage');
    expect(mock).toBeCalled();
  },
};

export const Action: ComponentStoryObj<typeof LibHook> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(message, 'getMessage');
        return [mock];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const mock = getMock(parameters, message, 'getMessage');
    mock.mockReturnValue('Action');
    userEvent.click(await canvas.findByRole('button'));
    await waitFor(() => {
      expect(canvas.getByText('Action')).toBeInTheDocument();
    });
  },
};
```
