import { useChannel, useEffect, useRef, useState } from '@storybook/addons';
import { STORY_RENDER_PHASE_CHANGED } from '@storybook/core-events';
import { Decorator } from '@storybook/react';
import React from 'react';
import { ADDON_ID, moduleMockParameter } from './types.js';

export const MockDecorator: Decorator = (Story, context) => {
  const { parameters, name, id } = context;
  const emit = useChannel({
    [STORY_RENDER_PHASE_CHANGED]: ({ newPhase, storyId }) => {
      if (newPhase === 'completed' && storyId === id) {
        if (moduleMock.mocks) {
          moduleMock.mocks.forEach((mock) => mock.mockClear());
        }
      }
    },
  });
  const [{ args }, render] = useState<{ args?: object }>({});
  const params = useRef(parameters);
  const { moduleMock } = params.current as moduleMockParameter;
  if (!moduleMock?.mocks) {
    const m = moduleMock?.mock?.();
    const mocks = !m ? undefined : Array.isArray(m) ? m : [m];
    moduleMock.mocks = mocks;
    moduleMock.render = (args) => render({ args });
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
  }, [id]);
  if (name === '$$mock$$') return <></>;
  return Story(args ? { args } : undefined);
};

export const parameters: moduleMockParameter = {
  moduleMock: {
    render: () => {
      //
    },
  },
};
