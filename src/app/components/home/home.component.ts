import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { ipcRenderer } from 'electron';
import { SandboxComponent } from '../sandbox/sandbox.component';
import { Circle } from '../sandbox/canvas/Circle';
import { Image as ImageObject } from '../sandbox/canvas/Image';

let containerMargin = 30;
  
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  
  private objects: Object = {};
  private images: Object = {};
  private isDone: boolean = false;
  private currentTime: string = 'Loading';
  
  @ViewChild('sandbox') sandbox: SandboxComponent;
  constructor() { }

  ngOnInit() {
    ipcRenderer.on('done', (event, arg) => {
      this.isDone = true;
      this.currentTime = 'Done';
    });
    
    ipcRenderer.on('load-image', (event, arg) => {
      let image = new Image();
      image.src = arg.url;
      this.images[arg.id] = image;
    });
    
    ipcRenderer.on('time-update', (event, arg) => {
      let time = arg.time;
      this.currentTime = time;
    });
    
    ipcRenderer.on('draw-image', (event, arg) => {
      this.objects[arg.id] = new ImageObject(arg.x, arg.y, arg.width, arg.height, this.images[arg.imageId]);
      this.sandbox.objects.push(this.objects[arg.id]);
    });
    
    ipcRenderer.on('draw-circle', (event, arg) => {
      this.objects[arg.id] = new Circle(arg.x, arg.y, arg.radius);
      this.sandbox.objects.push(this.objects[arg.id]);
    });
    
    ipcRenderer.on('hide-object', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      setTimeout(() => {
        this.objects[arg.id].hidden = true;
      }, arg.cycleInterval);
    });
    
    ipcRenderer.on('show-object', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      // setTimeout(() => {
      this.objects[arg.id].hidden = false;
      // }, arg.cycleInterval);
    });
    
    ipcRenderer.on('move', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      let obj = this.objects[arg.id];
      let deltaX = arg.x - obj.x;
      let deltaY = arg.y - obj.y;
      let intervalTime = 20;
      let numCycles = arg.cycleInterval / intervalTime;
      let deltaXPerIteration = deltaX / numCycles;
      let deltaYPerIteration = deltaY / numCycles;
      let iteration = 0;
      let animationTimer = setInterval(() => {
        if (iteration >= numCycles) {
          obj.x = arg.x;
          obj.y = arg.y;
          clearInterval(animationTimer);
          return;
        }
        obj.x += deltaXPerIteration;
        obj.y += deltaYPerIteration;
        iteration += 1;
      }, intervalTime);
    });
    
    ipcRenderer.on('move-to', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      let obj = this.objects[arg.id];
      obj.x = arg.x;
      obj.y = arg.y;
    });
    
    ipcRenderer.on('move-by', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      let obj = this.objects[arg.id];
      let deltaX = arg.x;
      let deltaY = arg.y;
      let intervalTime = 20;
      let numCycles = arg.cycleInterval / intervalTime;
      let deltaXPerIteration = deltaX / numCycles;
      let deltaYPerIteration = deltaY / numCycles;
      let iteration = 0;
      let animationTimer = setInterval(() => {
        if (iteration >= numCycles) {
          clearInterval(animationTimer);
          return;
        }
        obj.x += deltaXPerIteration;
        obj.y += deltaYPerIteration;
        iteration += 1;
      }, intervalTime);
    });
    
    this.sandbox.width = window.innerWidth - containerMargin;
  }
  
  canvasClicked(pos: any) {
    if (this.isDone) {
      return;
    }
    let data = {
      x: pos.x,
      y: pos.y,
      observation: 'click(X, Y)'
    }
    ipcRenderer.send('clicked', data);
  }
  
  canvasReady() {
    console.log('ready');
    ipcRenderer.send('view-ready');
  }
  
  ngOnDestroy() {
    ipcRenderer.send('view-destroyed');
  }
  
  @HostListener('window:unload', [ '$event' ])
  unloadHandler(event) {
    ipcRenderer.send('view-destroyed');
  }
  
  @HostListener('window:resize', [ '$event' ])
  resizeHandler(event) {
    this.sandbox.width = window.innerWidth - containerMargin;
  }

}
