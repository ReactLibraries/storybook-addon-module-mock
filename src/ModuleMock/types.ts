import type { Mock } from '@storybook/test';

export const ADDON_ID = 'storybook-addon-module-mock';
export const TAB_ID = `${ADDON_ID}/tab`;

export type ModuleType<T, N> = {
  __module: { module: T; name: N; event?: () => void };
  __name: string;
  __original: unknown;
};
export type Mocks = (Mock & ModuleType<unknown, unknown>)[];
export type ModuleMock<
  T extends { [key: string | number]: (...args: unknown[]) => unknown[] },
  N extends keyof T
> = Mock<ReturnType<T[N]>, Parameters<T[N]>> & ModuleType<T, N>;
export type moduleMockParameter = {
  moduleMock: {
    mock?: () => Mocks;
    mocks?: Mocks;
    render: (args?: { [key: string]: unknown }) => void;
  };
};

export type moduleMock = Pick<moduleMockParameter['moduleMock'], 'mock'>;
