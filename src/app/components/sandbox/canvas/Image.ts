import { CanvasObject } from './CanvasObject';

export class Image implements CanvasObject {
  
  x: number;
  y: number;
  width: number;
  height: number;
  private halfWidth: number;
  private halfHeight: number;
  
  hidden: boolean = false;
  flipHorizontal: boolean = false;
  flipVertical: boolean = false;
  
  image: HTMLImageElement;
  animations: Array<Function> = [];
  
  private imageFlippedHorizontally: HTMLCanvasElement;
  private imageFlippedVertically: HTMLCanvasElement;
  private imageFlippedBoth: HTMLCanvasElement;
  
  constructor(x: number, y: number, width: number, height: number, image: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
    
    this.halfWidth = width / 2;
    this.halfHeight = height / 2;
  }
  
  private handleFlips() {
    if (!this.flipVertical && !this.flipHorizontal) {
      return this.image;
    }
    if (this.flipVertical && this.flipHorizontal && this.imageFlippedBoth !== undefined) {
      return this.imageFlippedBoth;
    }
    if (this.flipVertical && this.imageFlippedVertically !== undefined) {
      return this.imageFlippedVertically;
    }
    if (this.flipHorizontal && this.imageFlippedHorizontally !== undefined) {
      return this.imageFlippedHorizontally;
    }
    
    let offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = this.width;
    offscreenCanvas.height = this.height;
    
    let offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    if (this.flipVertical) {
      offscreenCtx.translate(0, this.height);
      offscreenCtx.scale(1, -1);
    }
    if (this.flipHorizontal) {
      offscreenCtx.translate(this.width, 0);
      offscreenCtx.scale(-1, 1);
    }
    offscreenCtx.drawImage(this.image, 0, 0, this.width, this.height);
    offscreenCtx.restore();
    if (this.flipVertical && this.flipHorizontal) {
      this.imageFlippedBoth = offscreenCanvas;
    } else if (this.flipVertical) {
      this.imageFlippedVertically = offscreenCanvas;
    } else if (this.flipHorizontal) {
      this.imageFlippedHorizontally = offscreenCanvas;
    }
    
    return offscreenCanvas;
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
    let posX = this.x - this.halfWidth;
    let posY = this.y - this.halfHeight;
    let image = this.handleFlips();
    context.drawImage(image, posX, posY, this.width, this.height);
  }
  
}
