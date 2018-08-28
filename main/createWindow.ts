import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

export default function createWindow() {
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  let win = new BrowserWindow({
    x: 0,
    y: 0,
    title: 'LPS Studio',
    width: size.width,
    height: size.height,
    show: false
  });

  if (serve) {
    require('electron-reload')(__dirname, {
     electron: require(`${__dirname}/../node_modules/electron`)});
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  win.once('ready-to-show', () => {
    win.show();
    if (process.env.NODE_ENV === 'development') {
      win.webContents.openDevTools();
    }
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}
