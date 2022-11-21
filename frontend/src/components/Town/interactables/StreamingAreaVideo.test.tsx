import { ChakraProvider } from '@chakra-ui/react';
import { cleanup, render, RenderResult } from '@testing-library/react';
import { mock, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import StreamingAreaController from '../../../classes/StreamingAreaController';
import TownController from '../../../classes/TownController';
import TownControllerContext from '../../../contexts/TownControllerContext';
import { StreamingAreaVideo } from './StreamingAreaVideo';

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
  let streamingArea: StreamingAreaController;

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

    renderData = render(renderStreamingArea(streamingArea, townController));
  });

  describe('Checking the rendering of the StreamingArea', () => {
    it('The streaming area is rendered properly and uses the correct controller for its data', () => {
      const data = renderData.getByText(streamingArea.id, { exact: false });
      renderData.asFragment();
      expect(data).toBeInTheDocument();
    });
  });
});
