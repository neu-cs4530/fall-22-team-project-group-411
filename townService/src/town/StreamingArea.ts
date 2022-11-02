import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  TownEmitter,
  StreamingArea as StreamingAreaModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class StreamingArea extends InteractableArea {
  private _stream?: string;

  public get stream() {
    return this._stream;
  }

  /**
   * Creates a new StreamingArea
   *
   * @param streamingArea model containing this area's starting state
   * @param coords the bounding box that defines this Streaming area
   * @param emit a broadcast emitter that can be used to emit updates to players
   */
  public constructor({ id, stream }: StreamingAreaModel, coords: BoundingBox, emit: TownEmitter) {
    super(id, coords, emit);
    this._stream = stream;
  }

  /**
   * Removes a player from this streaming area.
   *
   * When the last player leaves, this method clears the stream of this area and
   * emits that update to all of the players
   *
   * @param player
   */
  public remove(player: Player): void {
    super.remove(player);
    if (this._occupants.length === 0) {
      this._stream = undefined;
      this._emitAreaChanged();
    }
  }

  /**
   * Updates the state of this StreamingArea, setting the stream
   *
   * @param streamingArea updated model
   */
  public updateModel({ stream }: StreamingAreaModel) {
    this._stream = stream;
  }

  /**
   * Convert this StreamingArea instance to a simple StreamingAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): StreamingAreaModel {
    return {
      id: this.id,
      stream: this.stream,
    };
  }

  /**
   * Creates a new StreamingArea object that will represent a Streaming Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this streaming area exists
   * @param townEmitter An emitter that can be used by this streaming area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): StreamingArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new StreamingArea({ id: name }, rect, townEmitter);
  }
}
