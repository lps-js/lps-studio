import { CanvasObject } from './CanvasObject';
import { createAnimation } from './AnimationHelper';

const animatablePropertiesTuple = [
  'position'
];
const animatablePropertiesNumber = [
  'strokeWeight'
];

export class Text implements CanvasObject {
  position: [number, number] = [0, 0];
  caption: string = '';
  font: string = '12px sans-serif';
  maxWidth: number = undefined;
  fillStyle: string = '#000';
  strokeStyle: string = '#FFF';
  strokeWeight: number = 0;

  isHidden: boolean = false;
  isDragEnabled: boolean = false;
  zIndex: number = 0;

  private animations: Array<Function> = [];

  private dragOffset: [number, number] = null;

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

    context.fillStyle = this.fillStyle;
    context.strokeStyle = this.strokeStyle;
    context.font = this.font;
    context.fillText(this.caption, this.position[0], this.position[1], this.maxWidth);
    if (this.strokeWeight > 0) {
      context.lineWidth = this.strokeWeight;
      context.strokeText(this.caption, this.position[0], this.position[1], this.maxWidth);
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

  isPositionHit(posX: number, posY: number) {
    // not supporting clicks on text object
    return false;
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
