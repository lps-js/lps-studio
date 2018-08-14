import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
const LPS = require('lps');

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

ipcMain.on('lps:start', (event, arg) => {
  let sender = event.sender;
  
  LPS.loadFile(arg)
    .then((engine) => {
      let queryResult = engine.query(LPS.literal('load_image(Id, Url)'));
      queryResult.forEach((imageTuple) => {
        let theta = imageTuple.theta;
        if (!(theta.Id instanceof LPS.Functor)
            || !(theta.Url instanceof LPS.Functor)) {
          return;
        }
        let id = theta.Id.evaluate();
        let url = theta.Url.evaluate();
        sender.send('load-image', { id: id, url: url });
      });
        
      ipcMain.once('lps:terminate', (event, arg) => {
        engine.halt();
        ipcMain.removeAllListeners('lps:pause');
        ipcMain.removeAllListeners('lps:unpause');
        ipcMain.removeAllListeners('clicked');
        ipcMain.removeAllListeners('input-observe');
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
      
      engine.on('warning', (err) => {
        console.log(err);
      });
      
      engine.on('error', (err) => {
        console.log(err);
      });
      
      engine.define('draw_image', (id, x, y, width, height, imageId) => {
        let data = {
          id: id.evaluate(),
          x: x.evaluate(),
          y: y.evaluate(),
          width: width.evaluate(),
          height: height.evaluate(),
          imageId: imageId.evaluate()
        };
        sender.send('draw-image', data);
        return [ { theta: {} } ];
      });
      
      engine.define('enable_drag', (id) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('enable-drag', data);
        return [ { theta: {} } ];
      });
      
      engine.define('show', (id) => {
        let data = {
          id: id.evaluate(),
          cycleInterval: engine.getCycleInterval()
        };
        sender.send('show-object', data);
        return [ { theta: {} } ];
      });
      
      engine.define('hide', (id) => {
        let data = {
          id: id.evaluate(),
          cycleInterval: engine.getCycleInterval()
        };
        sender.send('hide-object', data);
        return [ { theta: {} } ];
      });
      
      engine.define('flip_horizontal', (id) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('flip-horizontal', data);
        return [ { theta: {} } ];
      });
      
      engine.define('clear_flip_horizontal', (id) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('clear-flip-horizontal', data);
        return [ { theta: {} } ];
      });
      
      engine.define('set_flip_horizontal', (id) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('set-flip-horizontal', data);
        return [ { theta: {} } ];
      });
      
      engine.define('flip_vertical', (id) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('flip-vertical', data);
        return [ { theta: {} } ];
      });
      
      engine.define('clear_flip_vertical', (id) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('clear-flip-vertical', data);
        return [ { theta: {} } ];
      });
      
      engine.define('set_flip_vertical', (id) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('set-flip-vertical', data);
        return [ { theta: {} } ];
      });
      
      engine.define('draw_circle', (id, x, y, radius) => {
        let data = {
          id: id.evaluate(),
          x: x.evaluate(),
          y: y.evaluate(),
          radius: radius.evaluate()
        };
        sender.send('draw-circle', data);
        return [ { theta: {} } ];
      });
      
      engine.define('move', (id, x, y) => {
        let data = {
          id: id.evaluate(),
          x: x.evaluate(),
          y: y.evaluate(),
          cycleInterval: engine.getCycleInterval()
        };
        sender.send('move', data);
        return [ { theta: {} } ];
      });
      
      engine.define('move_to', (id, x, y) => {
        let data = {
          id: id.evaluate(),
          x: x.evaluate(),
          y: y.evaluate()
        };
        sender.send('move-to', data);
        return [ { theta: {} } ];
      });
      
      engine.define('move_by', (id, x, y) => {
        let data = {
          id: id.evaluate(),
          x: x.evaluate(),
          y: y.evaluate(),
          cycleInterval: engine.getCycleInterval()
        };
        sender.send('move-by', data);
        return [ { theta: {} } ];
      });

      engine.on('postCycle', () => {
        sender.send('time-update', { time: engine.getCurrentTime() });
      });
      
      engine.on('done', () => {
        sender.send('done');
      });
      
      engine.run();
    })
    .catch((err) => {
      console.error(err);
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
