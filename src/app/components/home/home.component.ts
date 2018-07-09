import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { ipcRenderer } from 'electron';
import { SandboxComponent } from '../sandbox/sandbox.component';
import { Circle } from '../sandbox/canvas/Circle';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  
  @ViewChild('sandbox') sandbox: SandboxComponent;
  constructor() { }

  ngOnInit() {
    ipcRenderer.on('draw-circle', (event, arg) => {
      console.log('drawing circle');
      this.sandbox.objects.push(new Circle(arg.x, arg.y, arg.radius));
    });
  }
  
  canvasClicked(pos: Object) {
    ipcRenderer.send('clicked', pos);
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

}
