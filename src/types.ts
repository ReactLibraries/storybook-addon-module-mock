import { jest } from "@storybook/jest";

export type ModuleType<T,N> = { __module: { module: T; name: N } }
export type Mocks = (ReturnType<typeof jest.fn> & ModuleType<unknown,unknown>)[];
export type Mock<T extends { [key: string | number]: unknown }, N extends keyof T> = 
  ReturnType<typeof jest.fn<ReturnType<T[N],>, Parameters<T[N]>>> & ModuleType<T,N>
export type moduleMockParameter = {
  moduleMock: {
    mock?: () => Mocks;
    mocks?: Mocks;
    render:()=>void
  };
};
