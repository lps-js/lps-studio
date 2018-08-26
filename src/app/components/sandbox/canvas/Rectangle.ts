import { CanvasObject } from './CanvasObject';
import { createAnimation } from './AnimationHelper';

const animatablePropertiesTuple = [
  'position',
  'size'
];
const animatablePropertiesNumber = [
  'strokeWeight'
];

export class Rectangle implements CanvasObject {
  private _position: [number, number] = [0, 0];
  private _size: [number, number] = [0, 0];

  private _canvasPosition: [number, number] = [0, 0];
  private _rectBottomRight: [number, number] = [0, 0];

  isHidden: boolean = false;
  isDragEnabled: boolean = false;

  strokeDash: Array<number> = [];
  strokeWeight: number = 1;
  strokeStyle: string = '#000';
  fillStyle: string = '#FFF';

  private animations: Array<Function> = [];

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

    context.beginPath();
    context.setLineDash(this.strokeDash);
    context.strokeStyle = this.strokeStyle;
    context.fillStyle = this.fillStyle;

    context.fillRect(this._canvasPosition[0], this._canvasPosition[1], this._size[0], this._size[1]);
    if (this.strokeWeight > 0) {
      context.lineWidth = this.strokeWeight;
      context.strokeRect(this._canvasPosition[0], this._canvasPosition[1], this._size[0], this._size[1]);
    }
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
}
