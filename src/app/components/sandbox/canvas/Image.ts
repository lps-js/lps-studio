import { CanvasObject } from './CanvasObject';

export class Image implements CanvasObject {
  x: number;
  y: number;
  private _size: Array<number> = [0, 0];
  private halfWidth: number = 0;
  private halfHeight: number = 0;

  isHidden: boolean = false;
  isDragEnabled: boolean = false;

  flipHorizontal: boolean = false;
  flipVertical: boolean = false;

  image: HTMLImageElement = null;
  animations: Array<Function> = [];

  private imageFlippedHorizontally: HTMLCanvasElement;
  private imageFlippedVertically: HTMLCanvasElement;
  private imageFlippedBoth: HTMLCanvasElement;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get size(): Array<number> {
    return this._size;
  }

  set size(s: Array<number>) {
    this._size = s;
    this.halfWidth = s[0] / 2;
    this.halfHeight = s[1] / 2;
  }

  private handleFlips() {
    if (!this.flipVertical && !this.flipHorizontal) {
      return this.image;
    }
    if (this.flipVertical && this.flipHorizontal && this.imageFlippedBoth !== undefined) {
      return this.imageFlippedBoth;
    }
    if (this.flipVertical && this.imageFlippedVertically !== undefined) {
      return this.imageFlippedVertically;
    }
    if (this.flipHorizontal && this.imageFlippedHorizontally !== undefined) {
      return this.imageFlippedHorizontally;
    }

    let offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = this._size[0];
    offscreenCanvas.height = this._size[1];

    let offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    if (this.flipVertical) {
      offscreenCtx.translate(0, this._size[1]);
      offscreenCtx.scale(1, -1);
    }
    if (this.flipHorizontal) {
      offscreenCtx.translate(this._size[0], 0);
      offscreenCtx.scale(-1, 1);
    }
    offscreenCtx.drawImage(this.image, 0, 0, this._size[0], this._size[1]);
    offscreenCtx.restore();
    if (this.flipVertical && this.flipHorizontal) {
      this.imageFlippedBoth = offscreenCanvas;
    } else if (this.flipVertical) {
      this.imageFlippedVertically = offscreenCanvas;
    } else if (this.flipHorizontal) {
      this.imageFlippedHorizontally = offscreenCanvas;
    }

    return offscreenCanvas;
  }

  draw(context: CanvasRenderingContext2D, timestamp: number) {
    if (this.isHidden) {
      return;
    }
    let newAnimations = [];
    this.animations.forEach((animation) => {
      let result = animation(timestamp);
      if (result !== false) {
        newAnimations.push(animation);
      }
    });
    this.animations = newAnimations;

    if (this.image === null) {
      return;
    }

    let posX = this.x - this.halfWidth;
    let posY = this.y - this.halfHeight;
    let image = this.handleFlips();
    context.drawImage(image, posX, posY, this._size[0], this._size[1]);
  }
}
