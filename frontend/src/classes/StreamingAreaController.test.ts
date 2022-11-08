import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { StreamingArea } from '../types/CoveyTownSocket';
import StreamingAreaController, { StreamingAreaEvents } from './StreamingAreaController';
import TownController from './TownController';

describe('StreamingAreaController', () => {
  // A valid StreamingAreaController to be reused within the tests
  let testArea: StreamingAreaController;
  let testAreaModel: StreamingArea;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<StreamingAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      id: nanoid(),
      stream: nanoid(),
    };
    testArea = new StreamingAreaController(testAreaModel);
    mockClear(townController);
    mockClear(mockListeners.streamChange);
    testArea.addListener('streamChange', mockListeners.streamChange);
  });
  describe('Setting stream property', () => {
    it('updates the property and emits a steamChange event if the property changes', () => {
      const newVideo = nanoid();
      testArea.stream = newVideo;
      expect(mockListeners.streamChange).toBeCalledWith(newVideo);
      expect(testArea.stream).toEqual(newVideo);
    });
    it('does not emit a streamChange event if the stream property does not change', () => {
      testArea.stream = `${testAreaModel.stream}`;
      expect(mockListeners.streamChange).not.toBeCalled();
    });
  });
  describe('streamingAreaModel', () => {
    it('Carries through all of the properties', () => {
      const model = testArea.streamingAreaModel();
      expect(model).toEqual(testAreaModel);
    });
  });
  describe('updateFrom', () => {
    it('Updates stream properties', () => {
      const newModel: StreamingArea = {
        id: testAreaModel.id,
        stream: nanoid(),
      };
      testArea.updateFrom(newModel);
      expect(testArea.stream).toEqual(newModel.stream);
      expect(mockListeners.streamChange).toBeCalledWith(newModel.stream);
    });
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: StreamingArea = {
        id: nanoid(),
        stream: nanoid(),
      };
      testArea.updateFrom(newModel);
      expect(testArea.id).toEqual(existingID);
    });
  });
});
