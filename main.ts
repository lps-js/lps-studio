import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import * as LPS from 'lps';
import studioEngineLoader from './src/main/studioEngineLoader';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

ipcMain.on('lps:start', (event, arg) => {
  let sender = event.sender;
  let programPathname = arg;
  let programPath = path.dirname(programPathname);

  let executionHaltCleanup = () => {
    ipcMain.removeAllListeners('lps:pause');
    ipcMain.removeAllListeners('lps:unpause');
    ipcMain.removeAllListeners('lps:observe');
  };

  LPS.loadFile(programPathname)
    .then((engine) => {
      studioEngineLoader(engine, programPath, sender);

      ipcMain.once('lps:halt', (event, arg) => {
        engine.halt();
        executionHaltCleanup();
        sender.send('canvas:lpsHalted');
      });

      ipcMain.on('lps:pause', (event, arg) => {
        engine.pause();
      });

      ipcMain.on('lps:unpause', (event, arg) => {
        engine.unpause();
      });

      ipcMain.on('lps:observe', (event, arg) => {
        let observation = LPS.literalSet(arg.input);
        engine.observe(observation);
      });

      engine.on('paused', () => {
        sender.send('canvas:lpsPaused');
      });

      engine.on('unpaused', () => {
        sender.send('canvas:lpsUnpaused');
      });

      engine.on('warning', (err) => {
        sender.send('lps-warning', err);
      });

      engine.on('error', (err) => {
        sender.send('lps-error', err.message);
        executionHaltCleanup();
      });

      engine.on('postCycle', () => {
        sender.send('time-update', { time: engine.getCurrentTime() });
      });

      engine.on('done', () => {
        sender.send('done');
        executionHaltCleanup();
      });

      sender.send('canvas:lpsStart', '');
      engine.run();
    })
    .catch((err) => {
      sender.send('lps-error', err.message);
      executionHaltCleanup();
    });
});

function createWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    title: 'LPS Studio',
    width: size.width,
    height: size.height,
    show: false
  });

  if (serve) {
    require('electron-reload')(__dirname, {
     electron: require(`${__dirname}/node_modules/electron`)});
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }


  win.once('ready-to-show', () => {
    win.show();
    win.webContents.openDevTools();
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
