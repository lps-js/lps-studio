import { Component, ViewChild, HostListener, ElementRef } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import { ipcRenderer } from 'electron';
import { Title } from '@angular/platform-browser';
import * as path from 'path';
const licenses = require('../../../../_licenses.json');

@Component({
  templateUrl: './license.component.html',
  styleUrls: ['./license.component.scss']
})
export class LicenseComponent {
  licenses = licenses;
  isShown: any = {};

  constructor(
    private electronService: ElectronService,
    private titleService: Title
  ) {
    this.titleService.setTitle('LPS Studio Licensing Information');
  }

  openLink($event: Event, link: string) {
    $event.preventDefault();
    if (!link.startsWith('https://') && !link.startsWith('http://')) {
      return;
    }
    this.electronService.remote.shell.openExternal(link);
  }
}
