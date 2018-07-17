import { CanvasObject } from './CanvasObject';

export class Image implements CanvasObject {
  
  x: number;
  y: number;
  width: number;
  height: number;
  private halfWidth: number;
  private halfHeight: number;
  hidden: boolean = false;
  image: HTMLImageElement;
  animations: Array<Function> = [];
  
  constructor(x: number, y: number, width: number, height: number, image: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
    
    this.halfWidth = width / 2;
    this.halfHeight = height / 2;
  }
  
  draw(context: CanvasRenderingContext2D) {
    if (this.hidden) {
      return;
    }
    let newAnimations = [];
    this.animations.forEach((animation) => {
      let result = animation();
      if (result !== false) {
        newAnimations.push(animation);
      }
    });
    this.animations = newAnimations;
    context.drawImage(this.image, this.x - this.halfWidth, this.y - this.halfHeight, this.width, this.height);
  }
  
}
