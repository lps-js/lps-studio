import { Injectable } from '@angular/core';
import { Circle } from '../components/sandbox/canvas';
import { Text } from '../components/sandbox/canvas';
import { Rectangle } from '../components/sandbox/canvas';
import { Square } from '../components/sandbox/canvas';
import { Line } from '../components/sandbox/canvas';
import { Image as ImageObject } from '../components/sandbox/canvas';

const typeMappings = {
  image: ImageObject,
  img: ImageObject,
  circle: Circle,
  text: Text,
  label: Text,
  rect: Rectangle,
  rectangle: Rectangle,
  square: Square,
  line: Line
};

@Injectable()
export class CanvasObjectService {

  private images: Object = {};
  private objects: Object = {};

  addImage(id: string, imageUrl: string) {
    let image = new Image();
    image.src = imageUrl;
    this.images[id] = image;
    return image;
  }

  removeImage(id: string) {
    if (this.images[id] === undefined) {
      return;
    }
    delete this.images[id];
  }

  registerObject(id: string, obj: any) {
    this.objects[id] = obj;
  }

  getObject(id: string) {
    return this.objects[id];
  }

  iterateObjects(callback: Function) {
    Object.keys(this.objects).forEach((key) => {
      let value = this.objects[key];
      callback(key, value);
    });
  }

  updateProperties(obj: any, properties: any) {
    Object.keys(properties).forEach((k) => {
      if (k === 'image') {
        obj.image = this.images[properties[k][0]];
        return;
      }
      if (typeof obj[k] === 'boolean') {
        if (properties[k][0] === 'flip') {
          obj[k] = !obj[k];
          return;
        }
        obj[k] = (properties[k][0] === 'true'
          || properties[k][0] === 'on'
          || properties[k][0] === 1);
        return;
      }
      if (Array.isArray(obj[k])) {
        obj[k] = properties[k];
        return;
      }
      if (typeof obj[k] === 'number'
          || typeof obj[k] === 'string') {
        obj[k] = properties[k][0];
      }
    });
  }

  buildObject(data: any) {
    if (typeMappings[data.type] === undefined) {
      return null;
    }
    let obj = new typeMappings[data.type]();
    this.updateProperties(obj, data.properties);
    return obj;
  }

  reset() {
    this.objects = {};
    this.images = {};
  }
}
