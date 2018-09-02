import { Component, ViewChild, HostListener, ElementRef } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { ipcRenderer } from 'electron';
import { Title } from '@angular/platform-browser';
import * as path from 'path';
const metadata = require('../../../../package.json');
const lpsMetadata = require('../../../../node_modules/lps/package.json');

@Component({
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  // app version
  version: string = metadata.version;
  lpsVersion: string = lpsMetadata.version;

  constructor(
    private electronService: ElectronService,
    private titleService: Title
  ) {
    this.titleService.setTitle('About LPS Studio');
  }

  openLink($event: Event, link: string) {
    $event.preventDefault();
    if (!link.startsWith('https://') && !link.startsWith('http://')) {
      return;
    }
    this.electronService.remote.shell.openExternal(link);
  }

  openLicenseWindow($event: Event) {
    ipcRenderer.send('app:openLicenseWindow');
    $event.preventDefault();
  }
}
