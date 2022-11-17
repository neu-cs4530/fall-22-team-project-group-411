import { ChakraProvider } from '@chakra-ui/react';
import { EventNames } from '@socket.io/component-emitter';
import { cleanup, render, RenderResult } from '@testing-library/react';
import { mock, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import { act } from 'react-dom/test-utils';
import * as ReactPlayer from 'react-player';
import StreamingAreaController, {
  StreamingAreaEvents,
} from '../../../classes/StreamingAreaController';
import TownController from '../../../classes/TownController';
import TownControllerContext from '../../../contexts/TownControllerContext';
import StreamingAreaVideo from './StreamingAreaVideo';

// A sentinel value that we will render in the mock react player component to help find it in the DOM tree
const MOCK_REACT_PLAYER_PLACEHOLDER = 'MOCK_REACT_PLAYER_PLACEHOLER';
// Mocking a React class-based component appears to be quite challenging; we define our own class
// to use as a mock here. Using jest-mock-extended's mock<ReactPlayer>() doesn't work.
class MockReactPlayer extends React.Component {
  private _componentDidUpdateSpy: jest.Mock<never, [ReactPlayer.ReactPlayerProps]>;

  private _seekSpy: jest.Mock<never, [number]>;

  public currentTime = 0;

  constructor(
    props: ReactPlayer.ReactPlayerProps,
    componentDidUpdateSpy: jest.Mock<never, [ReactPlayer.ReactPlayerProps]>,
    seekSpy: jest.Mock<never, [number]>,
  ) {
    super(props);
    this._componentDidUpdateSpy = componentDidUpdateSpy;
    this._seekSpy = seekSpy;
  }

  getCurrentTime() {
    return this.currentTime;
  }

  seekTo(newTime: number) {
    this.currentTime = newTime;
    this._seekSpy(newTime);
  }

  componentDidUpdate(): void {
    this._componentDidUpdateSpy(this.props);
  }

  render(): React.ReactNode {
    return <>{MOCK_REACT_PLAYER_PLACEHOLDER}</>;
  }
}

const reactPlayerSpy = jest.spyOn(ReactPlayer, 'default');
// This TS ignore is necessary in order to spy on a react class based component, apparently...
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
reactPlayerSpy.prototype = React.Component.prototype;

function renderStreamingArea(streamingArea: StreamingAreaController, controller: TownController) {
  return (
    <ChakraProvider>
      <TownControllerContext.Provider value={controller}>
        <StreamingAreaVideo controller={streamingArea} />
      </TownControllerContext.Provider>
    </ChakraProvider>
  );
}

describe('Testing StreamingAreaVideo', () => {
  const mockReactPlayerConstructor = jest.fn<never, [ReactPlayer.ReactPlayerProps]>();
  const componentDidUpdateSpy = jest.fn<never, [ReactPlayer.ReactPlayerProps]>();
  const seekSpy = jest.fn<never, [number]>();
  let mockReactPlayer: MockReactPlayer;
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
  beforeAll(() => {
    reactPlayerSpy.mockImplementation(function (props) {
      mockReactPlayerConstructor(props);
      const ret = new MockReactPlayer(props, componentDidUpdateSpy, seekSpy);
      mockReactPlayer = ret;
      return ret as any;
    });
  });
  beforeEach(() => {
    mockReactPlayerConstructor.mockClear();
    componentDidUpdateSpy.mockClear();
    seekSpy.mockClear();
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
   * Retrieve the properties passed to the ReactPlayer the first time it was rendered
   */
  function firstReactPlayerConstructorProps() {
    return mockReactPlayerConstructor.mock.calls[0][0];
  }
  /**
   * Retrieve the properties passed to the ReactPlayer the last time it was rendered
   */
  function lastReactPlayerPropUpdate() {
    return componentDidUpdateSpy.mock.calls[componentDidUpdateSpy.mock.calls.length - 1][0];
  }
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
    return (addedListeners[0][1] as unknown) as StreamingAreaEvents[Ev];
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
    return (removedListeners[0][1] as unknown) as StreamingAreaEvents[Ev];
  }
  describe('Checking the rendering of the StreamingArea', () => {
    it('Sets the videoURL', () => {
      const props = firstReactPlayerConstructorProps();
      expect(props.url).toEqual(streamingArea.stream);
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
