import SelectStreamModal from './SelectStreamModal';
import React from 'react';
import { cleanup, render, RenderResult, fireEvent } from '@testing-library/react';
import StreamingAreaController from '../../../classes/StreamingAreaController';
import TownController from '../../../classes/TownController';
import TownControllerContext from '../../../contexts/TownControllerContext';
import { nanoid } from 'nanoid';
import { mock, MockProxy } from 'jest-mock-extended';
import { StreamingArea as StreamingAreaModel } from '../../../types/CoveyTownSocket';

function renderSelectStreamModal(
  streamingArea: StreamingAreaController,
  controller: TownController,
  isOpen: boolean,
  onClose: jest.Mock<any, any>,
) {
  return (
    <TownControllerContext.Provider value={controller}>
      <SelectStreamModal isOpen={isOpen} close={onClose} streamingAreaController={streamingArea} />
    </TownControllerContext.Provider>
  );
}

describe('SelectStreamModal tests', () => {
  let townController: MockProxy<TownController>;
  let renderData: RenderResult;
  let streamingAreaController: StreamingAreaController;
  let onClose: jest.Mock<any, any>;

  beforeEach(() => {
    townController = mock<TownController>();
    onClose = jest.fn();
    streamingAreaController = new StreamingAreaController({
      id: nanoid(),
      stream: undefined,
      isStream: true,
    });
    renderData = render(
      renderSelectStreamModal(streamingAreaController, townController, true, onClose),
    );
  });

  afterEach(() => {
    // cleanup on exiting
    cleanup();
  });

  it('Renders the component correctly', () => {
    const data = renderData.getByText(streamingAreaController.id, { exact: false });
    expect(data).toBeInTheDocument();
  });
  it('Typing a stream and submitting will call the createStreamingArea method on the townController', () => {
    fireEvent.change(renderData.getByLabelText('Stream URL'), { target: { value: 'test' } });
    fireEvent.click(renderData.getByText('Set stream'));
    const expectedRequest: StreamingAreaModel = {
      id: streamingAreaController.id,
      stream: 'test',
      isStream: true,
    };
    expect(townController.createStreamingArea).toHaveBeenCalledWith(expectedRequest);
  });
  it('Typing nothing and submitting will not call the createStreamingArea method on the townController', () => {
    fireEvent.click(renderData.getByText('Set stream'));
    expect(townController.createStreamingArea).not.toHaveBeenCalled();
  });
  it('Hitting the cancel button will call the onClose callback', () => {
    fireEvent.click(renderData.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
