import { CanvasObject } from './CanvasObject';
import { createAnimation } from './AnimationHelper';

const animatablePropertiesTuple = [
  'start',
  'end'
];
const animatablePropertiesNumber = [
  'strokeWeight'
];

export class Line implements CanvasObject {
  start: [number, number] = [0, 0];
  end: [number, number] = [0, 0];

  strokeDash: Array<number> = [];
  strokeStyle: string = '#000';
  strokeWeight: number = 1;

  isHidden: boolean = false;
  isDragEnabled: boolean = false;
  zIndex: number = 0;

  private animations: Array<Function> = [];

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

    if (this.strokeWeight <= 0) {
      return;
    }

    context.setLineDash(this.strokeDash);
    context.strokeStyle = this.strokeStyle;
    context.lineWidth = this.strokeWeight;
    context.beginPath();
    context.moveTo(this.start[0], this.start[1]);
    context.lineTo(this.end[0], this.end[1]);
    context.stroke();
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

  isPositionHit(posX: number, posY: number) {
    // not supporting clicks on line object
    return false;
  }

  handleDrag(mousePosition: [number, number]) {

  }

  endDrag(mousePosition: [number, number]) {
    this.isDragEnabled = false;
  }
}
