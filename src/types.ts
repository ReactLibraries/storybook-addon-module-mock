import { jest } from "@storybook/jest";

export const ADDON_ID = 'storybook-addon-module-mock';
export const TAB_ID = `${ADDON_ID}/tab`;

export type ModuleType<T,N> = { __module: { module: T; name: N,event?:()=>void } ,__name:string}
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
