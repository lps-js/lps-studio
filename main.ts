import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
const LPS = require('lps');

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

ipcMain.on('view-ready', (event, arg) => {
  let sender = event.sender;
  
  LPS.load(__dirname + '/../lps/examples/studio.lps')
    .then((engine) => {
      ipcMain.once('view-destroyed', (event, arg) => {
        console.log('destroyed, terminate');
        engine.terminate();
      });
      
      ipcMain.on('clicked', (event, arg) => {
        console.log('observe');
        let theta = {
          X: new LPS.Value(arg.x),
          Y: new LPS.Value(arg.y)
        };
        let observation = LPS.literal('click(X, Y)').substitute(theta);
        console.log('' + observation);
        engine.observe(observation);
      });
      
      engine.define('draw_circle/5', (x, y, radius, t1, t2) => {
        console.log('draw circle!!!');
        sender.send('draw-circle', { x: x.evaluate(), y: y.evaluate(), radius: radius.evaluate() });
        return [ { theta: {} } ];
      });

      engine.on('postCycle', () => {
        console.log('TIME ' + engine.getCurrentTime());
      });
      
      engine.run();
    });
});

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  
  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
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

  win.webContents.openDevTools();

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
