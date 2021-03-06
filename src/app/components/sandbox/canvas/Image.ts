import { CanvasObject } from './CanvasObject';
import { createAnimation } from './AnimationHelper';

const animatablePropertiesTuple = [
  'position',
  'size'
];
const animatablePropertiesNumber = [];

export class Image implements CanvasObject {
  private _position: [number, number] = [0, 0];
  private _size: [number, number] = [0, 0];

  private _canvasPosition: [number, number] = [0, 0];
  private _rectBottomRight: [number, number] = [0, 0];

  isHidden: boolean = false;
  isDragEnabled: boolean = false;
  zIndex: number = 0;

  flipHorizontal: boolean = false;
  flipVertical: boolean = false;

  image: HTMLImageElement = null;

  private animations: Array<Function> = [];

  private imageFlippedHorizontally: HTMLCanvasElement;
  private imageFlippedVertically: HTMLCanvasElement;
  private imageFlippedBoth: HTMLCanvasElement;

  private dragOffset: [number, number] = null;

  private updatePositionSize() {
    this._canvasPosition[0] = this._position[0] - this._size[0] / 2;
    this._canvasPosition[1] = this._position[1] - this._size[1] / 2;

    this._rectBottomRight[0] = this._canvasPosition[0] + this._size[0];
    this._rectBottomRight[1] = this._canvasPosition[1] + this._size[1];
  }

  get position(): [number, number] {
    return this._position;
  }

  set position(p: [number, number]) {
    this._position = p;
    this.updatePositionSize();
  }

  get size(): [number, number] {
    return this._size;
  }

  set size(s: [number, number]) {
    this._size = s;
    this.updatePositionSize();
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

  draw(context: CanvasRenderingContext2D, isFrozen: boolean, timestamp: number) {
    if (this.isHidden) {
      return;
    }
    if (!isFrozen) {
      let newAnimations = [];
      this.animations.forEach((animation) => {
        let result = animation(timestamp);
        if (result !== false) {
          newAnimations.push(animation);
        }
      });
      this.animations = newAnimations;
    }

    if (this.image === undefined || this.image === null) {
      console.log('Invalid image field given')
      return;
    }

    let image = this.handleFlips();
    context.drawImage(
      image,
      this._canvasPosition[0],
      this._canvasPosition[1],
      this._size[0],
      this._size[1]
    );
  }

  addAnimations(duration: number, properties: any) {
    return createAnimation(
      this,
      this.animations,
      duration,
      animatablePropertiesTuple,
      animatablePropertiesNumber,
      properties
    );
  }

  isPositionHit(posX: number, posY: number): boolean {
    if (this.isHidden) {
      return false;
    }
    return posX >= this._canvasPosition[0]
      && posX <= this._rectBottomRight[0]
      && posY >= this._canvasPosition[1]
      && posY <= this._rectBottomRight[1];
  }

  handleDrag(mousePosition: [number, number]) {
    if (this.dragOffset === null) {
      this.dragOffset = [
        mousePosition[0] - this.position[0],
        mousePosition[1] - this.position[1]
      ];
      return;
    }
    this.position = [
      mousePosition[0] - this.dragOffset[0],
      mousePosition[1] - this.dragOffset[1]
    ];
  }

  endDrag(mousePosition: [number, number]) {
    this.position = [
      mousePosition[0] - this.dragOffset[0],
      mousePosition[1] - this.dragOffset[1]
    ];
    this.dragOffset = null;
    this.isDragEnabled = false;
  }
}
