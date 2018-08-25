import { CanvasObject } from './CanvasObject';

export class Square implements CanvasObject {
  x: number;
  y: number;
  isHidden: boolean = false;
  isDragEnabled: boolean = false;

  size: number = 0;
  strokeWeight: number = 1;
  strokeStyle: string = '#000';
  fillStyle: string = '#FFF';

  animations: Array<Function> = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
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
    context.strokeStyle = this.strokeStyle;
    context.fillStyle = this.fillStyle;

    context.fillRect(this.x, this.y, this.size, this.size);
    if (this.strokeWeight > 0) {
      context.lineWidth = this.strokeWeight;
      context.strokeRect(this.x, this.y, this.size, this.size);
    }
  }
}
