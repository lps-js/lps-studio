import { app, Menu, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import buildAboutMenu from './buildAboutMenu';

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

const urlPath = '/about';

const aboutDialogSize = [600, 400];

const aboutWindowMenu = buildAboutMenu();

let aboutWindowSingletonSingleton: BrowserWindow = null;

export default function createAboutWindow() {
  if (aboutWindowSingletonSingleton !== null) {
    aboutWindowSingletonSingleton.focus();
    return;
  }
  const screenSize = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  let aboutWindowSingleton = new BrowserWindow({
    x: screenSize.width / 2 - aboutDialogSize[0] / 2,
    y: screenSize.height / 2 - aboutDialogSize[1] / 2,
    title: 'About LPS Studio',
    width: aboutDialogSize[0],
    height: aboutDialogSize[1],
    minimizable: false,
    resizable: false,
    maximizable: false,
    show: true
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
    Menu.setApplicationMenu(aboutWindowMenu);
  });

  // aboutWindowSingleton.once('ready-to-show', () => {
  //   aboutWindowSingleton.show();
  // });

  // Emitted when the window is closed.
  aboutWindowSingleton.once('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    aboutWindowSingleton = null;
  });
}
