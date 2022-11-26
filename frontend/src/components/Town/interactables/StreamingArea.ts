import Interactable, { KnownInteractableTypes } from '../Interactable';

/**
 * Streaming area component that uses Phaser to interact with the frontend
 */
export default class StreamingArea extends Interactable {
  private _labelText?: Phaser.GameObjects.Text;

  private _defaultStream?: string;

  private _isInteracting = false;

  /**
   * gets the default stream for the current streaming area
   */
  public get defaultStream() {
    if (!this._defaultStream) {
      return undefined;
    }
    return this._defaultStream;
  }

  /**
   * adds the streaming area to the scene
   * implements the frontend component that prompts user to select a stream
   */
  addedToScene() {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);

    this._defaultStream = this.getData('stream');
    this._labelText = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      `Press space to choose a stream`,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._labelText.setVisible(false);
    this.townController.getStreamingAreaController(this);
    this.setDepth(-1);
  }

  /**
   * ensures that there is no text or interactable overlapping
   */
  overlap(): void {
    if (!this._labelText) {
      throw new Error('Should not be able to overlap with this interactable before added to scene');
    }
    const location = this.townController.ourPlayer.location;
    this._labelText.setX(location.x);
    this._labelText.setY(location.y);
    this._labelText.setVisible(true);
  }

  /**
   * exits if the interactable is overlapping with another interactable
   */
  overlapExit(): void {
    this._labelText?.setVisible(false);
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('endInteraction', this);
      this._isInteracting = false;
    }
  }

  /**
   * checks if a user is interacting with the current interactable
   */
  interact(): void {
    this._labelText?.setVisible(false);
    this._isInteracting = true;
  }

  /**
   * returns the type of interactable this object is
   * @returns a string indiciating that the current interactable is a streaming area
   */
  getType(): KnownInteractableTypes {
    return 'streamingArea';
  }
}
