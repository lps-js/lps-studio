import { CanvasObject } from '../components/sandbox/canvas';

export default function canvasObjectSorter(obj1: CanvasObject, obj2: CanvasObject) {
  return obj1.zIndex - obj2.zIndex;
}
