import { EventEmitter } from 'events';
import TypedEventEmitter from 'typed-emitter';
import { StreamingArea as StreamingAreaModel } from '../types/CoveyTownSocket';

export type StreamingAreaEvents = {
  /**
   * A streamChange event indicates that the stream selected for this streaming area has changed.
   * Listeners are passed the new stream, which is either a string (the twitch channel name), or
   * the value `undefined` to indicate that there is no channel set.
   */
  streamChange: (stream: string | undefined) => void;
};

export default class StreamingAreaController extends (EventEmitter as new () => TypedEventEmitter<StreamingAreaEvents>) {
  private _model: StreamingAreaModel;

  /**
   * Constructs a new StreamingAreaController, initialized with a provided
   * StreamingAreaModel.
   * @param streamingAreaModel The streaming area model that should be represented by this controller
   */
  public constructor(streamingAreaModel: StreamingAreaModel) {
    super();
    this._model = streamingAreaModel;
  }

  /**
   * The ID of the streaming area that is represented by this controller.
   * This is a read-only property: once a StreamingAreaController is initialized
   * it will always be tied to the same id.
   */
  public get id() {
    return this._model.id;
  }

  /**
   * The channel name of the Twitch stream assigned to this streaming area.
   * Or undefined if there is no channel set.
   */
  public get stream() {
    return this._model.stream;
  }

  /**
   * Updates the twitch channel assigned to this streaming area. Can be undefined to
   * set no channel.
   *
   * Changing this value will emit a 'streamChange' event to listeners.
   */
  public set stream(stream: string | undefined) {
    if (this._model.stream !== stream) {
      this._model.stream = stream;
      this.emit('streamChange', stream);
    }
  }

  /**
   * @returns the StreamingAreaModel whose state is represented by this controller.
   */
  public streamingAreaModel(): StreamingAreaModel {
    return this._model;
  }

  /**
   * Applies updates to this controllers stream value from the updated
   * model.
   * @param updatedModel the updated model to update this controller with
   */
  public updateFrom(updatedModel: StreamingAreaModel) {
    this.stream = updatedModel.stream;
  }
}
