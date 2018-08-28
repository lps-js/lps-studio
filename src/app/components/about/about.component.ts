import { Component, ViewChild, HostListener, ElementRef } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { ipcRenderer } from 'electron';
import { Title } from '@angular/platform-browser';
import * as path from 'path';
const metadata = require('../../../../package.json');

@Component({
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  private version: string = metadata.version;
  constructor(
    private electronService: ElectronService,
    private titleService: Title
  ) {
    this.titleService.setTitle('About LPS Studio');
  }

  openLink(link: string) {
    this.electronService.remote.shell.openExternal(link);
  }
}
