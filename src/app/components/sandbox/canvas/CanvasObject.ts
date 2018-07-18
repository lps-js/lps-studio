export interface CanvasObject {
  x: number;
  y: number;
  hidden: boolean;
  animations: Array<Function>;
  draw(context: CanvasRenderingContext2D, timestamp: number);
}
