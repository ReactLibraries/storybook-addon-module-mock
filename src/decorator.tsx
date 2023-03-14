import { DecoratorFn } from '@storybook/react';
import React, { useEffect, useState } from 'react';
import { moduleMockParameter } from './types';

export const MockDecorator: DecoratorFn = (Story, { parameters }) => {
  const [, render] = useState<{}>();
  const { moduleMock } = parameters as moduleMockParameter;
  if (!moduleMock?.mocks) {
    const mocks = moduleMock?.mock?.();
    moduleMock.mocks = !mocks ? undefined : Array.isArray(mocks) ? mocks : [mocks];
    moduleMock.render = () => render({});
  }

  useEffect(() => {
    return () => {
      if (moduleMock) {
        moduleMock.mocks?.forEach((mock) => mock.mockRestore());
        moduleMock.mocks = undefined;
      }
    };
  }, []);
  return <Story />;
};

export const parameters: moduleMockParameter = {
  moduleMock: {
    render: () => {
      //
    },
  },
};
