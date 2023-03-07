# storybook-addon-module-mock

Provides module mocking functionality like `jest.mock` on Storybook.

## usage

Added 'storybook-addon-module-mock' to Storybook addons.

### .storybook/main.js

```js
// @ts-check
/**
 * @type { import("@storybook/react/types").StorybookConfig}
 */
module.exports = {
  addons: ['storybook-addon-module-mock'],
};
```

### Sample

#### message.ts

Mock target file.

```tsx
export const getMessage = () => {
  return 'Before';
};
```

#### MockTest.tsx

```tsx
import React, { FC, useState } from 'react';
import { getMessage } from './message';

interface Props {}

/**
 * MockTest
 *
 * @param {Props} { }
 */
export const MockTest: FC<Props> = ({}) => {
  const [, reload] = useState({});
  return (
    <div>
      <button onClick={() => reload({})}>{getMessage()}</button>
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
import { ComponentMeta, ComponentStoryObj } from '@storybook/react';
import { MockTest } from './MockTest';
import { createMock, getMock } from 'storybook-addon-module-mock';

import * as message from './message';

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

export const Action: ComponentStoryObj<typeof MockTest> = {
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
