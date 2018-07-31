import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';
import { CanvasObject } from './canvas/CanvasObject';
import { Circle } from './canvas/Circle';

@Component({
  selector: 'sandbox',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.scss']
})
export class SandboxComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('mainCanvas') mainCanvas: ElementRef;
  public context: CanvasRenderingContext2D;
  
  private refreshInterval: number = 20;
  
  @Input() objects: Array<CanvasObject> = new Array<CanvasObject>();
  
  @Output() onMouse = new EventEmitter<Object>();
  @Output() ready = new EventEmitter();
  
  private _isMouseDown: boolean = false;
  
  private _width: number = 400;
  private _height: number = 400;

  constructor() {
  }
  
  get isMouseDown(): boolean {
    return this._isMouseDown;
  }
  
  get width(): number {
    return this._width;
  }

  @Input()
  set width(name: number) {
    this._width = name;
    this.mainCanvas.nativeElement.width = this._width;
  }
    
  get height(): number {
    return this._height;
  }

  @Input()
  set height(height: number) {
    this._height = height;
    this.mainCanvas.nativeElement.height = this._height;
  }

  ngOnInit() {}
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.mainCanvas.nativeElement.width = this._width;
      this.mainCanvas.nativeElement.height = this._height;
      this.context = (<HTMLCanvasElement>this.mainCanvas.nativeElement).getContext('2d');
      this.ready.emit();
      requestAnimationFrame((ts) => {
        this.canvasDraw(ts);
      });
    }, 0);
  }
  
  handleMouseEvent(event, name) {
    event.stopPropagation();
    let x = event.offsetX;
    let y = event.offsetY;
    
    if (name === 'mousedown') {
      this._isMouseDown = true;
    } else if (name === 'mouseup') {
      this._isMouseDown = false;
    }
    
    this.onMouse.emit({ event: name, x: x, y: y });
  }
  
  private canvasDraw(timestamp: number) {
    if (this.context === null) {
      return;
    }
    // prepare next frame
    requestAnimationFrame((ts) => {
      this.canvasDraw(ts);
    });
    this.context.clearRect(0, 0, this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);
    this.objects.forEach((obj) => {
      obj.draw(this.context, timestamp);
    });
  }
  
  ngOnDestroy() {
  }

}
