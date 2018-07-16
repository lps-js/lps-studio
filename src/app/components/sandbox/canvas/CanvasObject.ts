export interface CanvasObject {
  x: number;
  y: number;
  hidden: boolean;
  draw(context: CanvasRenderingContext2D);
}
