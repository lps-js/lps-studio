export interface CanvasObject {
  x: number;
  y: number;
  isHidden: boolean;
  isDragEnabled: boolean;
  animations: Array<Function>;
  draw(context: CanvasRenderingContext2D, timestamp: number);
}
