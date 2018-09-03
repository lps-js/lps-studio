import { CanvasObject } from './CanvasObject';
import { createAnimation } from './AnimationHelper';

const animatablePropertiesTuple = [
  'position'
];
const animatablePropertiesNumber = [
  'size',
  'strokeWeight'
];

export class Square implements CanvasObject {
  private _position: [number, number] = [0, 0];
  private _size: number = 0;

  private _canvasPosition: [number, number] = [0, 0];
  private _rectBottomRight: [number, number] = [0, 0];

  isHidden: boolean = false;
  isDragEnabled: boolean = false;
  zIndex: number = 0;

  strokeDash: Array<number> = [];
  strokeWeight: number = 1;
  strokeStyle: string = '#000';
  fillStyle: string = '#FFF';

  private animations: Array<Function> = [];

  private dragOffset: [number, number] = null;

  private updatePositionSize() {
    this._canvasPosition[0] = this._position[0] - this._size / 2;
    this._canvasPosition[1] = this._position[1] - this._size / 2;
    this._rectBottomRight[0] = this._canvasPosition[0] + this._size;
    this._rectBottomRight[1] = this._canvasPosition[1] + this._size;
  }

  get position(): [number, number] {
    return this._position;
  }

  set position(p: [number, number]) {
    this._position = p;
    this.updatePositionSize();
  }

  get size(): number {
    return this._size;
  }

  set size(s: number) {
    this._size = s;
    this.updatePositionSize();
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

    context.beginPath();
    context.setLineDash(this.strokeDash);
    context.strokeStyle = this.strokeStyle;
    context.fillStyle = this.fillStyle;

    context.fillRect(
      this._canvasPosition[0],
      this._canvasPosition[1],
      this._size,
      this._size
    );
    if (this.strokeWeight > 0) {
      context.lineWidth = this.strokeWeight;
      context.strokeRect(
        this._canvasPosition[0],
        this._canvasPosition[1],
        this._size,
        this._size
      );
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
