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
  
  private refreshInterval: number = 50;
  private timer: NodeJS.Timer;
  
  @Input() objects: Array<CanvasObject> = new Array<CanvasObject>();
  @Output() click = new EventEmitter<Object>();

  constructor() {
  }

  ngOnInit() {
    this.timer = setInterval(() => {
      this.canvasDraw();
    }, this.refreshInterval);
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.mainCanvas.nativeElement.width = 400;
      this.mainCanvas.nativeElement.height = 400;
      this.context = (<HTMLCanvasElement>this.mainCanvas.nativeElement).getContext('2d');
    }, 0);
  }
  
  canvasClick(event) {
    let x = event.offsetX;
    let y = event.offsetY;
    
    this.objects.push(new Circle(x, y, 5));
    this.click.emit({ x: x, y: y });
  }
  
  private canvasDraw() {
    if (this.context === null) {
      return;
    }
    this.context.clearRect(0, 0, this.mainCanvas.nativeElement.width, this.mainCanvas.nativeElement.height);
    this.objects.forEach((obj) => {
      obj.draw(this.context);
    });
  }
  
  ngOnDestroy() {
    clearInterval(this.timer);
  }

}
