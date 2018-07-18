import { CanvasObject } from './CanvasObject';

export class Circle implements CanvasObject {
  
  x: number;
  y: number;
  hidden: boolean = false;
  radius: number;
  animations: Array<Function> = [];
  
  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
  
  draw(context: CanvasRenderingContext2D, timestamp: number) {
    if (this.hidden) {
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
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    context.stroke();
  }
  
}
