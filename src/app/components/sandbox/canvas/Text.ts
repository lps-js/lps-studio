import { CanvasObject } from './CanvasObject';

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

  radius: number;
  animations: Array<Function> = [];

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

    context.fillStyle = this.fillStyle;
    context.strokeStyle = this.strokeStyle;
    context.font = this.font;
    context.fillText(this.caption, this.position[0], this.position[1], this.maxWidth);
    if (this.strokeWeight > 0) {
      context.lineWidth = this.strokeWeight;
      context.strokeText(this.caption, this.position[0], this.position[1], this.maxWidth);
    }
  }

  isPositionHit(posX: number, posY: number) {
    // not supporting clicks on text object
    return false;
  }
}
