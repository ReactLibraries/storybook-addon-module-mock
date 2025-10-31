# storybook-addon-module-mock

[![](https://img.shields.io/npm/l/storybook-addon-module-mock)](https://www.npmjs.com/package/storybook-addon-module-mock)
[![](https://img.shields.io/npm/v/storybook-addon-module-mock)](https://www.npmjs.com/package/storybook-addon-module-mock)
[![](https://img.shields.io/npm/dw/storybook-addon-module-mock)](https://www.npmjs.com/package/storybook-addon-module-mock)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ReactLibraries/storybook-addon-module-mock)

Provides module mocking functionality like `jest.mock` on Storybook@10.

Added 'storybook-addon-module-mock' to Storybook addons.  
Only works if webpack is used in the Builder.

If you use Vite for your Builder, use this package.  
https://www.npmjs.com/package/storybook-addon-vite-mock

## Screenshot

![](https://raw.githubusercontent.com/ReactLibraries/storybook-addon-module-mock/master/document/image/image01.png)  
![](https://raw.githubusercontent.com/ReactLibraries/storybook-addon-module-mock/master/document/image/image02.png)

## usage

- Sample code  
  https://github.com/SoraKumo001/storybook-module-mock

## Regarding how to interrupt a mock

Interrupt webpack's `module.exports` to allow insertion of mock.  
In doing so, disable `storybook build` optimization.

## Addon options

If include is omitted, all modules are covered.

```tsx
  addons: [
    {
      name: 'storybook-addon-module-mock',
      options: {
        include: ["**/action.*"], // glob pattern
        exclude: ["**/node_modules/**"],
      }
    }
  ],
```

### Storybook@8 & Next.js

- .storybook/main.ts

```ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  stories: ['../src/**/*.stories.@(tsx)'],
  build: {
    test: {
      disabledAddons: ['@storybook/addon-docs', '@storybook/addon-essentials/docs'],
    },
  },
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
    {
      name: 'storybook-addon-module-mock',
      options: {
        exclude: ['**/node_modules/@mui/**'],
      },
    },
  ],
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
import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import React, { DependencyList } from 'react';
import { createMock, getMock, getOriginal } from 'storybook-addon-module-mock';
import { MockTest } from './MockTest';

const meta: Meta<typeof MockTest> = {
  tags: ['autodocs'],
  component: MockTest,
};
export default meta;

export const Primary: StoryObj<typeof MockTest> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Before')).toBeInTheDocument();
  },
};

export const Mock: StoryObj<typeof MockTest> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(React, 'useMemo');
        mock.mockImplementation((fn: () => unknown, deps: DependencyList) => {
          // Call the original useMemo
          const value = getOriginal(mock)(fn, deps);
          // Change the return value under certain conditions
          return value === 'Before' ? 'After' : value;
        });
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

export const Action: StoryObj<typeof MockTest> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const useMemo = React.useMemo;
        const mock = createMock(React, 'useMemo');
        mock.mockImplementation(useMemo);
        return [mock];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const mock = getMock(parameters, React, 'useMemo');
    mock.mockImplementation((fn: () => unknown, deps: DependencyList) => {
      const value = getOriginal(mock)(fn, deps);
      return value === 'Before' ? 'Action' : value;
    });
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
import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { createMock, getMock } from 'storybook-addon-module-mock';
import { LibHook } from './LibHook';
import * as message from './message';

const meta: Meta<typeof LibHook> = {
  tags: ['autodocs'],
  component: LibHook,
};
export default meta;

export const Primary: StoryObj<typeof LibHook> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Before')).toBeInTheDocument();
  },
};

export const Mock: StoryObj<typeof LibHook> = {
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
    console.log(mock);
    expect(mock).toBeCalled();
  },
};

export const Action: StoryObj<typeof LibHook> = {
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

### Sample3

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

```tsx
import { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import React, { DependencyList } from 'react';
import { createMock, getMock, getOriginal } from 'storybook-addon-module-mock';
import { MockTest } from './MockTest';

const meta: Meta<typeof MockTest> = {
  tags: ['autodocs'],
  component: MockTest,
};
export default meta;

export const Primary: StoryObj<typeof MockTest> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Before')).toBeInTheDocument();
  },
};

export const Mock: StoryObj<typeof MockTest> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const mock = createMock(React, 'useMemo');
        mock.mockImplementation((fn: () => unknown, deps: DependencyList) => {
          // Call the original useMemo
          const value = getOriginal(mock)(fn, deps);
          // Change the return value under certain conditions
          return value === 'Before' ? 'After' : value;
        });
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

export const Action: StoryObj<typeof MockTest> = {
  parameters: {
    moduleMock: {
      mock: () => {
        const useMemo = React.useMemo;
        const mock = createMock(React, 'useMemo');
        mock.mockImplementation(useMemo);
        return [mock];
      },
    },
  },
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    const mock = getMock(parameters, React, 'useMemo');
    mock.mockImplementation((fn: () => unknown, deps: DependencyList) => {
      const value = getOriginal(mock)(fn, deps);
      return value === 'Before' ? 'Action' : value;
    });
    userEvent.click(await canvas.findByRole('button'));
    await waitFor(() => {
      expect(canvas.getByText('Action')).toBeInTheDocument();
    });
  },
};
```

### Sample4

#### ReRenderArgs.tsx

```tsx
import React, { FC } from 'react';
import styled from './ReRenderArgs.module.scss';

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
```

#### ReRenderArgs.stories.tsx

```tsx
import { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from '@storybook/test';
import { createMock, getMock, render } from 'storybook-addon-module-mock';
import * as message from './message';
import { ReRender } from './ReRender';

const meta: Meta<typeof ReRender> = {
  tags: ['autodocs'],
  component: ReRender,
};
export default meta;

export const Primary: StoryObj<typeof ReRender> = {};

export const ReRenderTest: StoryObj<typeof ReRender> = {
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
    mock.mockReturnValue('Test1');
    render(parameters);
    await waitFor(() => {
      expect(canvas.getByText('Test1')).toBeInTheDocument();
    });
    mock.mockReturnValue('Test2');
    render(parameters);
    await waitFor(() => {
      expect(canvas.getByText('Test2')).toBeInTheDocument();
    });
  },
};
```
