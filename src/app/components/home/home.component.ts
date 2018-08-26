import { Component, OnInit, OnDestroy, ViewChild, HostListener, ElementRef } from '@angular/core';
import { ipcRenderer } from 'electron';
import { SandboxComponent } from '../sandbox/sandbox.component';
import { CanvasObject } from '../sandbox/canvas/CanvasObject';
import { ElectronService } from '../../providers/electron.service';
import { CanvasObjectService } from '../../providers/canvasObject.service';
import { OpenDialogOptions } from 'electron';
import * as path from 'path';

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
  currentTime: string = 'No program loaded';

  isDone: boolean = false;
  isPaused: boolean = false;
  isRunning: boolean = false;
  isMouseDown: boolean = false;

  currentFile: string;
  private LPS;

  @ViewChild('sandbox') sandbox: SandboxComponent;
  constructor(
    private electronService: ElectronService,
    private canvasObjectService: CanvasObjectService
  ) {
    this.LPS = this.electronService.remote.require('lps');
  }

  ngOnInit() {
    ipcRenderer.on('canvas:lpsStart', (event, arg) => {
      this.isRunning = true;
    });

    ipcRenderer.on('lps-error', (event, arg) => {
      this.consoleLog('Error: ' + arg);
      this.isRunning = false;
    });

    ipcRenderer.on('done', (event, arg) => {
      this.isDone = true;
      this.isRunning = false;
      this.currentTime = 'Done';
      this.consoleLog('LPS Program execution complete');
    });

    ipcRenderer.on('canvas:loadImage', (event, arg) => {
      let image = this.canvasObjectService.addImage(arg.id, arg.url);
      image.onerror = () => {
        this.sandbox.objects.splice(0, this.sandbox.objects.length);
        this.canvasObjectService.removeImage(arg.id);
        this.requestStop();
        this.consoleLog('Error: Unable to load image ' + arg.id + ' from ' + arg.url);
      };
    });

    ipcRenderer.on('canvas:defineObject', (event, arg) => {
      let obj = this.canvasObjectService.buildObject(arg);
      if (obj === null) {
        this.requestStop();
        this.consoleLog('Error: Invalid object declaration given for ' + arg.id);
        return;
      }
      if (arg.id !== null) {
        this.canvasObjectService.registerObject(arg.id, obj);
      }
      this.sandbox.objects.push(obj);
    });

    ipcRenderer.on('canvas:updateObject', (event, arg) => {
      let id = arg.id;
      let obj = this.canvasObjectService.getObject(id);
      this.canvasObjectService.updateProperties(obj, arg.properties);
    });

    ipcRenderer.on('canvas:lpsTimeUpdate', (event, arg) => {
      let time = arg.time;
      this.currentTime = time;
      this.consoleLog('Time ' + time);
    });

    // ipcRenderer.on('move', (event, arg) => {
    //   if (this.objects[arg.id] === undefined) {
    //     return;
    //   }
    //   let obj = <CanvasObject>this.objects[arg.id];
    //   let origin = {
    //     x: obj.x,
    //     y: obj.y
    //   };
    //   let deltaX = arg.x - origin.x;
    //   let deltaY = arg.y - origin.y;
    //   let iteration = 0;
    //   this.consoleLog('Start moving "' + arg.id + '" from (' + origin.x + ', ' + origin.y + ')');
    //   let startTime;
    //   let animateFunc = (timestamp) => {
    //     if (startTime === undefined) {
    //       startTime = timestamp;
    //     }
    //     let duration = timestamp - startTime;
    //     if (duration >= arg.cycleInterval) {
    //       obj.x = arg.x;
    //       obj.y = arg.y;
    //       this.consoleLog('End moving "' + arg.id + '" to (' + arg.x + ', ' + arg.y + ')');
    //       return false;
    //     }
    //     let ratio = duration / arg.cycleInterval;
    //     obj.x = origin.x + ratio * deltaX;
    //     obj.y = origin.y + ratio * deltaY;
    //     iteration += 1;
    //     return true;
    //   };
    //   obj.animations.push(animateFunc);
    // });

    this.sandbox.width = window.innerWidth;
    this.sandbox.height = window.innerHeight - timebarHeight;
  }

  handleCanvasMouseEvent(e: any) {
    if (!this.isRunning || this.isDone) {
      return;
    }
    let eventName = e.event;
    let observations = [];
    let observation: any;
    let theta: any;

    let forEachObjectInPosition = (callback) => {
      this.canvasObjectService.iterateObjects((key: string, obj: CanvasObject) => {
        if (obj.isPositionHit(e.x, e.y)) {
          callback(key, obj);
        }
      });
    }

    switch (eventName) {
      case 'click':
        observation = this.LPS.literal('click(X, Y)');
        theta = {
          X: e.x,
          Y: e.y
        };
        observations.push(observation.substitute(theta));
        forEachObjectInPosition((key, obj) => {
          observation = this.LPS.literal('click(ObjectId, X, Y)');
          theta.ObjectId = key;
          observations.push(observation.substitute(theta));
        });
        break;
      case 'mousedown':
        observation = this.LPS.literal('mousedown(X, Y)');
        theta = {
          X: e.x,
          Y: e.y
        };
        observations.push(observation.substitute(theta));
        forEachObjectInPosition((key, obj) => {
          observation = this.LPS.literal('mousedown(ObjectId, X, Y)');
          theta.ObjectId = key;
          observations.push(observation.substitute(theta));
        });
        break;
      case 'mouseup':
        // reset isDragEnabled for all objects
        theta = {
          X: e.x,
          Y: e.y
        };
        this.canvasObjectService.iterateObjects((key, obj) => {
          if (!obj.isDragEnabled) {
            return;
          }
          // was dragging

          observation = this.LPS.literal('draggedTo(ObjectId, X, Y)');
          theta.ObjectId = key;
          observations.push(observation.substitute(theta));
          obj.isDragEnabled = false;
        });

        observation = this.LPS.literal('mouseup(X, Y)');
        theta = {
          X: e.x,
          Y: e.y
        };
        observations.push(observation.substitute(theta));
        forEachObjectInPosition((key, obj) => {
          observation = this.LPS.literal('mouseup(ObjectId, X, Y)');
          theta.ObjectId = key;
          observations.push(observation.substitute(theta));
        });
        break;
      case 'mousemove':
        if (this.sandbox.isMouseDown) {
          // possibly dragging?
          this.canvasObjectService.iterateObjects((key, obj) => {
            if (!obj.isDragEnabled) {
              return;
            }
            obj.animations.push(() => {
              obj.x = e.x;
              obj.y = e.y;
              return false;
            });
          });
        }

        observation = this.LPS.literal('mousemove(X, Y)');
        theta = {
          X: e.x,
          Y: e.y
        };
        observations.push(observation.substitute(theta));
        forEachObjectInPosition((key, obj) => {
          observation = this.LPS.literal('mousemove(ObjectId, X, Y)');
          theta.ObjectId = key;
          observations.push(observation.substitute(theta));
        });
        break;
    }

    let input = '';
    observations.forEach((observation) => {
      if (input !== '') {
        input += ',';
      }
      input += observation.toString();
    });
    if (input === '') {
      return;
    }
    ipcRenderer.send('lps:observe', { input: input });
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

  handleCanvasReady() {
  }

  requestPause() {
    if (!this.isRunning || this.isPaused) {
      return;
    }
    this.isPaused = true;
    ipcRenderer.send('lps:pause');
    this.consoleLog('Pausing LPS program execution...');
  }

  requestResume() {
    if (!this.isRunning || !this.isPaused) {
      return;
    }
    this.isPaused = false;
    ipcRenderer.send('lps:unpause');
    this.consoleLog('Resuming LPS program execution...');
  }

  requestStop() {
    if (!this.isRunning) {
      return;
    }
    this.isPaused = false;
    ipcRenderer.send('lps:halt');
    this.consoleLog('Stopping LPS program execution...');
  }

  requestRestart() {
    if (this.isRunning || this.currentFile === undefined) {
      return;
    }

    const name = path.basename(this.currentFile);

    this.canvasObjectService.reset();
    this.sandbox.objects = [];

    ipcRenderer.send('lps:start', this.currentFile);

    this.currentTime = 'Loading ' + name;
    this.consoleLog('Restarting ' + name);
    this.isRunning = true;
    this.isPaused = false;
    this.isDone = false;
  }

  requestOpenFile() {
    const dialog = this.electronService.remote.dialog;
    let options: OpenDialogOptions = {
      filters: [
        { name: 'LPS Programs', extensions: ['lps'] }
      ],
      properties: [
        'openFile'
      ]
    };
    let browserWindow = this.electronService.remote.getCurrentWindow();
    dialog.showOpenDialog(browserWindow, options, (filenames) => {
      if (filenames === undefined || filenames.length !== 1) {
        return;
      }

      this.canvasObjectService.reset();
      this.sandbox.objects = [];

      let filename = filenames[0];
      this.currentFile = filename;

      const name = path.basename(this.currentFile);

      ipcRenderer.send('lps:start', filename);

      this.consoleLog('Starting ' + name);
      this.currentTime = 'Loading ' + name;
      this.isRunning = true;
      this.isPaused = false;
      this.isDone = false;
    });
  }

  ngOnDestroy() {
    ipcRenderer.send('lps:terminate');
  }

  @HostListener('window:unload', [ '$event' ])
  unloadHandler(event) {
    ipcRenderer.send('lps:terminate');
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
