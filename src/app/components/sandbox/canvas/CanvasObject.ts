export interface CanvasObject {
  isHidden: boolean;
  isDragEnabled: boolean;
  zIndex: number;
  draw(context: CanvasRenderingContext2D, isFrozen: boolean, timestamp: number);
  isPositionHit(posX: number, posY: number): boolean;
  addAnimations(duration: number, properties: any);
  handleDrag(mousePosition: [number, number]);
  endDrag(mousePosition: [number, number]);
}
