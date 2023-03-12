/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@storybook/jest';
import { Mock, moduleMockParameter } from '../types';
import type { Parameters as P } from '@storybook/react';

export const createMock: {
  <
    T extends { [key in N]: (...args: any[]) => unknown },
    N extends keyof T = 'default' extends keyof T ? keyof T : never
  >(
    module: T,
    name?: N
  ): Mock<T, N>;
  <T extends { [key in 'default']: (...args: any[]) => unknown }>(module: T): Mock<T, 'default'>;
} = <T extends { [key in N]: (...args: any[]) => unknown }, N extends keyof T>(
  module: T,
  name: N = 'default' as N
): Mock<T, N> => {
  const fn = jest.fn<ReturnType<T[N]>, Parameters<T[N]>>();
  if ('$$mock$$' in module) {
    const mock = (module as unknown as { $$mock$$: (name: N, value: unknown) => unknown }).$$mock$$;
    const f = mock(name, fn);
    fn.mockRestore = () => {
      mock(name, f);
    };
  } else {
    const f = module[name];
    module[name] = fn as never;
    fn.mockRestore = () => {
      module[name] = f;
    };
  }
  return Object.assign(fn, { __module: { module, name } });
};

export const getMock: {
  <T extends { [key in N]: (...args: any[]) => unknown }, N extends keyof T>(
    parameters: P,
    module: T,
    name: N
  ): Mock<T, N>;
  <T extends { [key in 'default']: (...args: any[]) => unknown }>(parameters: P, module: T): Mock<
    T,
    'default'
  >;
} = <T extends { [key in N]: (...args: any[]) => unknown }, N extends keyof T>(
  parameters: P,
  module: T,
  name: N = 'default' as N
): Mock<T, N> => {
  const mock = (parameters as moduleMockParameter).moduleMock.mocks?.find((mock) => {
    return mock.__module?.module === module && mock.__module?.name === name;
  });
  if (!mock) throw new Error("Can't find mock");
  return mock as unknown as Mock<T, N>;
};

export const resetMock = (parameters: P) => {
  (parameters as moduleMockParameter).moduleMock.mocks?.forEach((mock) => {
    return mock.mockReset();
  });
};

export const clearMock = (parameters: P) => {
  (parameters as moduleMockParameter).moduleMock.mocks?.forEach((mock) => {
    return mock.mockClear();
  });
};
