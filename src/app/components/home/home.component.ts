import { Component, OnInit, OnDestroy, ViewChild, HostListener, ElementRef } from '@angular/core';
import { ipcRenderer } from 'electron';
import { SandboxComponent } from '../sandbox/sandbox.component';
import { Circle } from '../sandbox/canvas/Circle';
import { Image as ImageObject } from '../sandbox/canvas/Image';
import { CanvasObject } from '../sandbox/canvas/CanvasObject';
import { ElectronService } from '../../providers/electron.service';
import { OpenDialogOptions } from 'electron';
  
const timebarHeight = 45; // px
  
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  
  @ViewChild('consoleOutput') consoleOutputView: ElementRef;
  
  messages: Array<string> = [];
  
  consoleInput: String;
  currentTime: string = 'Loading';
  
  private objects: Object = {};
  private images: Object = {};
  private isDone: boolean = false;
  
  @ViewChild('sandbox') sandbox: SandboxComponent;
  constructor(
    private electronService: ElectronService
  ) { }

  ngOnInit() {
    ipcRenderer.on('done', (event, arg) => {
      this.isDone = true;
      this.currentTime = 'Done';
      this.consoleLog('LPS Program execution complete');
    });
    
    ipcRenderer.on('load-image', (event, arg) => {
      let image = new Image();
      image.src = arg.url;
      this.images[arg.id] = image;
    });
    
    ipcRenderer.on('time-update', (event, arg) => {
      let time = arg.time;
      this.currentTime = time;
      this.consoleLog('Time ' + time);
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
      let obj = <CanvasObject>this.objects[arg.id];
      setTimeout(() => {
        obj.animations.push(() => {
          obj.hidden = true;
          this.consoleLog('Hiding "' + arg.id + '"');
          return false;
        });
      }, arg.cycleInterval);
    });
    
    ipcRenderer.on('show-object', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      let obj = <CanvasObject>this.objects[arg.id];
      setTimeout(() => {
        obj.hidden = false;
        this.consoleLog('Showing "' + arg.id + '"');
      }, arg.cycleInterval);
    });
    
    ipcRenderer.on('flip-vertical', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      let obj = <ImageObject>this.objects[arg.id];
      setTimeout(() => {
        obj.flipVertical = !obj.flipVertical;
        this.consoleLog('Flipping "' + arg.id + '" Vertically');
      }, 50);
    });
    
    ipcRenderer.on('clear-flip-vertical', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      let obj = <ImageObject>this.objects[arg.id];
      setTimeout(() => {
        obj.flipVertical = false;
        this.consoleLog('Clear "' + arg.id + '" Vertical Flip');
      }, 50);
    });
    
    ipcRenderer.on('set-flip-vertical', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      let obj = <ImageObject>this.objects[arg.id];
      setTimeout(() => {
        obj.flipVertical = true;
        this.consoleLog('Set "' + arg.id + '" Vertical Flip');
      }, 50);
    });
    
    ipcRenderer.on('flip-horizontal', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      let obj = <ImageObject>this.objects[arg.id];
      setTimeout(() => {
        obj.flipHorizontal = !obj.flipHorizontal;
        this.consoleLog('Flipping "' + arg.id + '" Horizontally');
      }, 50);
    });
    
    ipcRenderer.on('clear-flip-horizontal', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      let obj = <ImageObject>this.objects[arg.id];
      setTimeout(() => {
        obj.flipHorizontal = false;
        this.consoleLog('Clear "' + arg.id + '" Horizontal Flip');
      }, 50);
    });
    
    ipcRenderer.on('set-flip-horizontal', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      let obj = <ImageObject>this.objects[arg.id];
      setTimeout(() => {
        obj.flipHorizontal = true;
        this.consoleLog('Set "' + arg.id + '" Horizontal Flip');
      }, 50);
    });
    
    ipcRenderer.on('move', (event, arg) => {
      if (this.objects[arg.id] === undefined) {
        return;
      }
      let obj = <CanvasObject>this.objects[arg.id];
      let origin = {
        x: obj.x,
        y: obj.y
      };
      let deltaX = arg.x - origin.x;
      let deltaY = arg.y - origin.y;
      let iteration = 0;
      this.consoleLog('Start moving "' + arg.id + '" from (' + origin.x + ', ' + origin.y + ')');
      let startTime;
      let animateFunc = (timestamp) => {
        if (startTime === undefined) {
          startTime = timestamp;
        }
        let duration = timestamp - startTime;
        if (duration >= arg.cycleInterval) {
          obj.x = arg.x;
          obj.y = arg.y;
          this.consoleLog('End moving "' + arg.id + '" to (' + arg.x + ', ' + arg.y + ')');
          return false;
        }
        let ratio = duration / arg.cycleInterval;
        obj.x = origin.x + ratio * deltaX;
        obj.y = origin.y + ratio * deltaY;
        iteration += 1;
        return true;
      };
      obj.animations.push(animateFunc);
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
      let animateFunc = () => {
        if (iteration >= numCycles) {
          return false;
        }
        obj.x += deltaXPerIteration;
        obj.y += deltaYPerIteration;
        iteration += 1;
        return true;
      };
      obj.animations.push(animateFunc);
    });
    
    this.sandbox.width = window.innerWidth;
    this.sandbox.height = window.innerHeight - timebarHeight;
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
  
  consoleLog(message: string) {
    let element = this.consoleOutputView.nativeElement;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 50)
    }
    this.messages.push(message);
  }
  
  canvasReady() {
    ipcRenderer.send('view-ready');
    this.consoleLog('Studio Ready for LPS Program Execution');
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
    this.sandbox.width = window.innerWidth;
    this.sandbox.height = window.innerHeight - timebarHeight;
  }
  
  consoleInputKeypress(event) {
    if (event.keyCode !== 13) {
      return;
    }
    this.consoleLog('Observing "' + this.consoleInput + '"');
    ipcRenderer.send('input-observe', { input: this.consoleInput });
    this.consoleInput = '';
  }

}
