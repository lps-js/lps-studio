import { CanvasObject } from './CanvasObject';

export class Text implements CanvasObject {
  x: number;
  y: number;
  caption: string = '';
  font: string = '12px sans-serif';
  maxWidth: number = undefined;
  
  isHidden: boolean = false;
  isDragEnabled: boolean = false;
  
  radius: number;
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
    let originalFont = context.font;
    context.font = this.font;
    context.fillText(this.caption, this.x, this.y);
    // restore font
    context.font = originalFont;
  }
}
