/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from '@storybook/jest';
import { ModuleMock, moduleMockParameter } from '../types';
import type { Parameters as P } from '@storybook/react';
import type { Mock } from 'jest-mock';

const hookFn = <T, Y extends unknown[]>(hook: (fn: Mock<T, Y>) => void) => {
  const fnSrc = jest.fn<T, Y>();
  const fn = Object.assign((...args: any[]): any => {
    const result = fnSrc(...(args as any));
    hook(fnSrc);
    return result;
  }, fnSrc);
  fn.bind(fnSrc);
  Object.defineProperty(fn, 'mock', {
    get: () => {
      return fnSrc.mock;
    },
  });
  return fn as Mock<T, Y> & { originalValue?: unknown };
};

export const createMock: {
  <
    T extends { [key in N]: (...args: any[]) => unknown },
    N extends keyof T = 'default' extends keyof T ? keyof T : never
  >(
    module: T,
    name?: N
  ): ModuleMock<T, N>;
  <T extends { [key in 'default']: (...args: any[]) => unknown }>(module: T): ModuleMock<
    T,
    'default'
  >;
} = <T extends { [key in N]: (...args: any[]) => unknown }, N extends keyof T>(
  module: T,
  name: N = 'default' as N
): ModuleMock<T, N> => {
  const moduleName = module.constructor.prototype.__moduleId__;
  const funcName = name;

  const fn = hookFn<ReturnType<T[N]>, Parameters<T[N]>>(() => {
    (fn as ModuleMock<T, N> & { __name__: string }).__module.event?.();
  });
  const descriptor = Object.getOwnPropertyDescriptor(module, name);
  let original: unknown;
  if (descriptor?.writable) {
    const f = module[name];
    module[name] = fn as never;
    original = f;
    fn.mockRestore = () => {
      module[name] = f;
    };
  } else if ('$$mock$$' in module) {
    const mock = (module as unknown as { $$mock$$: (name: N, value: unknown) => unknown }).$$mock$$;
    const f = mock(name, fn);
    original = f;
    fn.mockRestore = () => {
      mock(name, f);
    };
  } else {
    throw new Error('Failed to write mock');
  }
  return Object.assign(fn, {
    __module: { module, name },
    __name: `[${moduleName ?? 'unknown'}]:${String(funcName)}`,
    __original: original as T[N],
  });
};

export const getOriginal = <
  T extends { [key in N]: (...args: any[]) => unknown },
  N extends keyof T = 'default' extends keyof T ? keyof T : never
>(
  mock: ModuleMock<T, N>
): T[N] extends never ? any : T[N] => {
  return mock.__original as T[N];
};

export const getMock: {
  <T extends { [key in N]: (...args: any[]) => unknown }, N extends keyof T>(
    parameters: P,
    module: T,
    name: N
  ): ModuleMock<T, N>;
  <T extends { [key in 'default']: (...args: any[]) => unknown }>(
    parameters: P,
    module: T
  ): ModuleMock<T, 'default'>;
} = <T extends { [key in N]: (...args: any[]) => unknown }, N extends keyof T>(
  parameters: P,
  module: T,
  name: N = 'default' as N
): ModuleMock<T, N> => {
  const mock = (parameters as moduleMockParameter).moduleMock.mocks?.find((mock) => {
    return mock.__module?.module === module && mock.__module?.name === name;
  });
  if (!mock) throw new Error("Can't find mock");
  return mock as unknown as ModuleMock<T, N>;
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

export const render = (parameters: P, args?: object) => {
  (parameters as moduleMockParameter).moduleMock.render(args);
};
