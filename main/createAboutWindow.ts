import { app, Menu, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import buildAboutMenu from './buildAboutMenu';

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

const urlPath = '/about';

const aboutDialogSize = [600, 400];

let aboutWindowMenu = null;

let aboutWindowSingleton: BrowserWindow = null;

export default function createAboutWindow() {
  if (aboutWindowSingleton !== null) {
    aboutWindowSingleton.show();
    aboutWindowSingleton.focus();
    return;
  }
  if (aboutWindowMenu === null) {
    aboutWindowMenu = buildAboutMenu();
  }
  const screenSize = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  aboutWindowSingleton = new BrowserWindow({
    x: screenSize.width / 2 - aboutDialogSize[0] / 2,
    y: screenSize.height / 2 - aboutDialogSize[1] / 2,
    title: 'About LPS Studio',
    width: aboutDialogSize[0],
    height: aboutDialogSize[1],
    minimizable: false,
    resizable: false,
    maximizable: false,
    show: false
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/../node_modules/electron`)
    });
    aboutWindowSingleton.loadURL('http://localhost:4200/#' + urlPath);
  } else {
    aboutWindowSingleton.loadURL(url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      hash: urlPath,
      slashes: true
    }));
  }

  aboutWindowSingleton.on('focus', () => {
    if (process.platform === 'darwin') {
      Menu.setApplicationMenu(aboutWindowMenu);
    }
  });

  aboutWindowSingleton.once('ready-to-show', () => {
    aboutWindowSingleton.show();
  });

  // Emitted when the window is closed.
  aboutWindowSingleton.on('close', (event) => {
    // hide window for reuse
    event.preventDefault();
    aboutWindowSingleton.hide();
  });
}
