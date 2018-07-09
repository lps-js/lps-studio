import { CanvasObject } from './CanvasObject';

export class Circle implements CanvasObject {
  
  x: number;
  y: number;
  radius: number;
  
  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
  
  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    context.stroke();
  }
  
}
