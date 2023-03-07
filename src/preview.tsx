import { DecoratorFn } from '@storybook/react';
import React, { useEffect } from 'react';
import { moduleMockParameter } from './types';

const MockDecorator: DecoratorFn = (Story, { parameters }) => {
  const { moduleMock } = parameters as moduleMockParameter;
  if (!moduleMock?.mocks) {
    const mocks = moduleMock?.mock?.();
    moduleMock.mocks = !mocks ? undefined : Array.isArray(mocks) ? mocks : [mocks];
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
  moduleMock: {},
};

export const decorators = [MockDecorator];
