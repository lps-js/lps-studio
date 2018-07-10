export interface CanvasObject {
  x: number;
  y: number;
  draw(context: CanvasRenderingContext2D);
}
