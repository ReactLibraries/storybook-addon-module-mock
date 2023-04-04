import { useChannel } from '@storybook/addons';
import { Decorator } from '@storybook/react';
import React, { useState, useEffect, useRef } from 'react';
import { ADDON_ID, moduleMockParameter } from '../types';

export const MockDecorator: Decorator = (Story, { parameters, name }) => {
  const emit = useChannel({});
  const [, render] = useState<{} | undefined>(undefined);
  const params = useRef(parameters);
  const { moduleMock } = params.current as moduleMockParameter;
  if (!moduleMock?.mocks) {
    const m = moduleMock?.mock?.();
    const mocks = !m ? undefined : Array.isArray(m) ? m : [m];
    moduleMock.mocks = mocks;
    moduleMock.render = () => render({});
    if (mocks) {
      const sendStat = () => {
        emit(
          ADDON_ID,
          mocks.map((mock) => {
            return [mock.__name, mock.mock];
          })
        );
      };
      mocks.forEach((mock) => (mock.__module.event = () => sendStat()));
      sendStat();
    } else {
      emit(ADDON_ID, []);
    }
  }
  useEffect(() => {
    return () => {
      if (moduleMock.mocks) {
        moduleMock.mocks.forEach((mock) => mock.mockRestore());
        moduleMock.mocks = undefined;
      }
    };
  }, []);
  if (name === '$$mock$$') return <></>;
  return Story();
};

export const parameters: moduleMockParameter = {
  moduleMock: {
    render: () => {
      //
    },
  },
};
