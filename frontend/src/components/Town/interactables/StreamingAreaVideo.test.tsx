import { ChakraProvider } from '@chakra-ui/react';
import { EventNames } from '@socket.io/component-emitter';
import { cleanup, render, RenderResult } from '@testing-library/react';
import { mock, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import { act } from 'react-dom/test-utils';
import StreamingAreaController, {
  StreamingAreaEvents,
} from '../../../classes/StreamingAreaController';
import TownController from '../../../classes/TownController';
import TownControllerContext from '../../../contexts/TownControllerContext';
import { StreamingAreaContainer } from './StreamingAreaVideo';
import StreamingArea from './StreamingArea';
import TownGameScene from '../TownGameScene';
import { Renderer } from 'phaser';

jest.mock('./StreamingArea');
jest.mock('./TownGameScene');

function renderStreamingArea(streamingArea: StreamingAreaController, controller: TownController) {
  const townGameScene: TownGameScene = new TownGameScene(controller);
  const streamingAreaInteractable: StreamingArea = new StreamingArea(townGameScene);
  streamingAreaInteractable.name = streamingArea.id;
  return (
    <ChakraProvider>
      <TownControllerContext.Provider value={controller}>
        <StreamingAreaContainer streamingArea={streamingAreaInteractable} />
      </TownControllerContext.Provider>
    </ChakraProvider>
  );
}

describe('Testing StreamingAreaVideo', () => {
  let streamingArea: StreamingAreaController;
  type StreamingAreaEventName = keyof StreamingAreaEvents;
  let addListenerSpy: jest.SpyInstance<
    StreamingAreaController,
    [event: StreamingAreaEventName, listener: StreamingAreaEvents[StreamingAreaEventName]]
  >;

  let removeListenerSpy: jest.SpyInstance<
    StreamingAreaController,
    [event: StreamingAreaEventName, listener: StreamingAreaEvents[StreamingAreaEventName]]
  >;

  let townController: MockProxy<TownController>;

  let renderData: RenderResult;

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    townController = mock<TownController>();
    streamingArea = new StreamingAreaController({
      id: 'test',
      stream: nanoid(),
      isStream: true,
    });

    addListenerSpy = jest.spyOn(streamingArea, 'addListener');
    removeListenerSpy = jest.spyOn(streamingArea, 'removeListener');

    renderData = render(renderStreamingArea(streamingArea, townController));
  });
  /**
   * Retrieve the listener passed to "addListener" for a given eventName
   * @throws Error if the addListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerAdded<Ev extends EventNames<StreamingAreaEvents>>(
    eventName: Ev,
    spy = addListenerSpy,
  ): StreamingAreaEvents[Ev] {
    const addedListeners = spy.mock.calls.filter(eachCall => eachCall[0] === eventName);
    if (addedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one addListener call for ${eventName} but found ${addedListeners.length}`,
      );
    }
    return addedListeners[0][1] as unknown as StreamingAreaEvents[Ev];
  }
  /**
   * Retrieve the listener pased to "removeListener" for a given eventName
   * @throws Error if the removeListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerRemoved<Ev extends EventNames<StreamingAreaEvents>>(
    eventName: Ev,
  ): StreamingAreaEvents[Ev] {
    const removedListeners = removeListenerSpy.mock.calls.filter(
      eachCall => eachCall[0] === eventName,
    );
    if (removedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one removeListeners call for ${eventName} but found ${removedListeners.length}`,
      );
    }
    return removedListeners[0][1] as unknown as StreamingAreaEvents[Ev];
  }
  describe('Checking the rendering of the StreamingArea', () => {
    it('Sets the videoURL', () => {
      const { getByText } = render(renderStreamingArea(streamingArea, townController));
      expect(getByText('test')).toBeInTheDocument();
    });
  });
  describe('Bridging events from the StreamingAreaController to the ReactPlayer', () => {
    describe('Registering StreamingAreaController listeners', () => {
      describe('When rendered', () => {
        it('Registers exactly one streamChange listener', () => {
          act(() => {
            streamingArea.emit('streamChange', streamingArea.stream);
          });
          act(() => {
            streamingArea.emit('streamChange', streamingArea.stream);
          });
          act(() => {
            streamingArea.emit('streamChange', streamingArea.stream);
          });
          getSingleListenerAdded('streamChange');
        });
        it('Removes the streamChange listener at unmount', () => {
          act(() => {
            streamingArea.emit('streamChange', '');
          });
          const listenerAdded = getSingleListenerAdded('streamChange');
          cleanup();
          expect(getSingleListenerRemoved('streamChange')).toBe(listenerAdded);
        });
      });
      describe('When re-rendered with a different streaming area controller', () => {
        it('Removes the listeners on the old streaming area controller and adds listeners to the new controller', () => {
          const origStream = getSingleListenerAdded('streamChange');

          const newStreamingArea = new StreamingAreaController({
            id: 'test',
            stream: nanoid(),
            isStream: true,
          });
          const newAddListenerSpy = jest.spyOn(newStreamingArea, 'addListener');
          renderData.rerender(renderStreamingArea(newStreamingArea, townController));
          expect(getSingleListenerRemoved('streamChange')).toBe(origStream);
          getSingleListenerAdded('streamChange', newAddListenerSpy);
        });
      });
    });
  });
});
