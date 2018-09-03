import { CanvasObject } from './CanvasObject';
import { createAnimation } from './AnimationHelper';

const PI_2 = Math.PI * 2;
const animatablePropertiesTuple = [
  'position'
];
const animatablePropertiesNumber = [
  'radius',
  'strokeWeight'
];

export class Circle implements CanvasObject {
  position: [number, number] = [0, 0];
  isHidden: boolean = false;
  zIndex: number = 0;
  isDragEnabled: boolean = false;

  private dragOffset: [number, number] = null;

  private _radius: number = 0;
  private _radius2: number = 0;
  strokeDash: Array<number> = [];
  strokeWeight: number = 1;
  strokeStyle: string = '#000';
  fillStyle: string = '#FFF';

  private animations: Array<Function> = [];

  get radius(): number {
    return this._radius;
  }

  set radius(r: number) {
    this._radius = r;
    this._radius2 = r * r;
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

    context.arc(
      this.position[0],
      this.position[1],
      this._radius,
      0,
      PI_2,
      true
    );

    context.fill();
    if (this.strokeWeight > 0) {
      context.lineWidth = this.strokeWeight;
      context.stroke();
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
    let dx = posX - this.position[0];
    let dy = posY - this.position[1];
    let d = dx * dx + dy * dy;
    return d < this._radius2;
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
