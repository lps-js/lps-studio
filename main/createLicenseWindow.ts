import { app, Menu, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import buildAboutMenu from './buildAboutMenu';

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

const urlPath = '/license';

const licenseDialogSize = [600, 400];

let licenseWindowMenu = null;

let licenseWindowSingleton: BrowserWindow = null;

export default function createLicenseWindow() {
  if (licenseWindowSingleton !== null) {
    licenseWindowSingleton.focus();
    return;
  }
  if (licenseWindowMenu === null) {
    licenseWindowMenu = buildAboutMenu();
  }
  const screenSize = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  licenseWindowSingleton = new BrowserWindow({
    x: screenSize.width / 2 - licenseDialogSize[0] / 2,
    y: screenSize.height / 2 - licenseDialogSize[1] / 2,
    title: 'About LPS Studio',
    width: licenseDialogSize[0],
    height: licenseDialogSize[1],
    minimizable: false,
    resizable: false,
    maximizable: false,
    show: true
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/../node_modules/electron`)
    });
    licenseWindowSingleton.loadURL('http://localhost:4200/#' + urlPath);
  } else {
    licenseWindowSingleton.loadURL(url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      hash: urlPath,
      slashes: true
    }));
  }

  licenseWindowSingleton.on('focus', () => {
    if (process.platform === 'darwin') {
      Menu.setApplicationMenu(licenseWindowMenu);
    }
  });

  // licenseWindowSingleton.once('ready-to-show', () => {
  //   licenseWindowSingleton.show();
  // });

  // Emitted when the window is closed.
  licenseWindowSingleton.once('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    licenseWindowSingleton = null;
  });
}
