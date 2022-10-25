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
   * @param coordinates the bounding box that defines this Streaming area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, stream }: StreamingAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
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
    // todo
  }

  /**
   * Updates the state of this StreamingArea, setting the stream
   *
   * @param streamingArea updated model
   */
  public updateModel({ stream }: StreamingAreaModel) {
    // todo
  }

  /**
   * Convert this StreamingArea instance to a simple StreamingAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): StreamingAreaModel {
    return {
      // todo
    };
  }

  /**
   * Creates a new StreamingArea object that will represent a Streaming Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this streaming area exists
   * @param townEmitter An emitter that can be used by this streaming area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): StreamingArea {
    // todo
  }
}
