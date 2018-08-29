import { app, Menu, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import buildMainMenu from './buildMainMenu';

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

const mainWindowMenu = buildMainMenu();

let numOfMainWindow = 0;

export function getNumOfMainWindow() {
  return numOfMainWindow;
}

const minSize = [ 500, 300 ];

export default function createMainWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  let window = new BrowserWindow({
    x: 0,
    y: 0,
    title: 'LPS Studio',
    width: size.width,
    height: size.height,
    minWidth: minSize[0],
    minHeight: minSize[1],
    show: false
  });

  if (serve) {
    require('electron-reload')(__dirname, {
     electron: require(`${__dirname}/../node_modules/electron`)});
    window.loadURL('http://localhost:4200');
  } else {
    window.loadURL(url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  window.on('focus', () => {
    Menu.setApplicationMenu(mainWindowMenu);
  });

  window.once('ready-to-show', () => {
    window.show();
    if (process.env.NODE_ENV === 'development') {
      window.webContents.openDevTools();
    }
  });
  numOfMainWindow += 1;

  // Emitted when the window is closed.
  window.once('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    window = null;
    numOfMainWindow -= 1;
  });
}
