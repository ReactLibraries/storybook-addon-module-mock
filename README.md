# storybook-addon-module-mock

Provides module mocking functionality like `jest.mock` on Storybook.

![](https://raw.githubusercontent.com/ReactLibraries/storybook-addon-module-mock/master/document/image/image01.png)  
![](https://raw.githubusercontent.com/ReactLibraries/storybook-addon-module-mock/master/document/image/image02.png)

## usage

Added 'storybook-addon-module-mock' to Storybook addons.  
Only works if Webpack is used in the Builder.

Please place the following file in the project root so that 'babel' is used.  
If you do not do this, @storybook/nextjs will select 'swc' and it will not work.

- .babelrc

```json
{}
```

- Sample code  
  https://github.com/SoraKumo001/storybook-module-mock

## Regarding how to interrupt a mock

Interruptions vary depending on the Storybook mode.

- storybook dev
  - Make `module.exports` writable using Webpack functionality
- storybook build
  - Insert code to rewrite `module.exports` using Babel functionality

## Addon options

Include and exclude are enabled for `storybook build` where Babel is used.
Not used in `storybook dev`.

If include is omitted, all modules are covered.

```tsx
  addons: [
    {
      name: 'storybook-addon-module-mock',
      options: {
        include: [/message/,"**/action.*"], // RegExp or glob pattern
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
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from '@storybook/testing-library';
import React from 'react';
import { createMock, getMock, getOriginal } from 'storybook-addon-module-mock';
import { MockTest } from './MockTest';

const meta: Meta<typeof MockTest> = {
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
        mock.mockImplementation((fn: () => unknown, deps: unknown[]) => {
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
    mock.mockImplementation((fn: () => unknown, deps: unknown[]) => {
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
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { waitFor, within } from '@storybook/testing-library';
import { render } from 'storybook-addon-module-mock';
import { ReRenderArgs } from './ReRenderArgs';

const meta: Meta<typeof ReRenderArgs> = {
  component: ReRenderArgs,
  args: { value: 'Test' },
};
export default meta;

export const Primary: StoryObj<typeof ReRenderArgs> = {
  args: {},
  play: async ({ canvasElement, parameters }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Test')).toBeInTheDocument();

    // Re-render with new props
    render(parameters, { value: 'Test2' });
    await waitFor(() => {
      expect(canvas.getByText('Test2')).toBeInTheDocument();
    });

    // Re-render with new props
    render(parameters, { value: 'Test3' });
    await waitFor(() => {
      expect(canvas.getByText('Test3')).toBeInTheDocument();
    });

    // Re-render with new props
    render(parameters, { value: 'Test4' });
    await waitFor(() => {
      expect(canvas.getByText('Test4')).toBeInTheDocument();
    });
  },
};
```
