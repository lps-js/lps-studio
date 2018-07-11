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
  @Output() clicked = new EventEmitter<Object>();
  @Output() ready = new EventEmitter();
  
  private _width: number = 400;
  private _height: number = 400;

  constructor() {
  }
  
  get width(): number {
    // transform value for display
    return this._width;
  }

  @Input()
  set width(name: number) {
    this._width = name;
    this.mainCanvas.nativeElement.width = this._width;
  }
    
  get height(): number {
    // transform value for display
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
      this.canvasDraw();
    }, 0);
  }
  
  canvasClick(event) {
    let x = event.offsetX;
    let y = event.offsetY;
    
    this.clicked.emit({ x: x, y: y });
  }
  
  private canvasDraw() {
    if (this.context === null) {
      return;
    }
    requestAnimationFrame(() => {
      this.canvasDraw();
    });
    this.context.clearRect(0, 0, this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);
    this.objects.forEach((obj) => {
      obj.draw(this.context);
    });
  }
  
  ngOnDestroy() {
  }

}
