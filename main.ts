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
  
  LPS.load(__dirname + '/../lps/examples/fire-example-studio.lps')
    .then((engine) => {
      let queryResult = engine.query(LPS.literal('load_image(Id, Url)'));
      queryResult.forEach((imageTuple) => {
        let theta = imageTuple.theta;
        if (!(theta.Id instanceof LPS.Value) || !(theta.Url instanceof LPS.Value)) {
          return;
        }
        let id = theta.Id.evaluate();
        let url = theta.Url.evaluate();
        sender.send('load-image', { id: id, url: url });
      });
        
      ipcMain.once('view-destroyed', (event, arg) => {
        console.log('destroyed, terminate');
        engine.terminate();
      });
      
      ipcMain.on('input-observe', (event, arg) => {
        let observation = LPS.literalSet(arg.input);
        engine.observe(observation);
      });
      
      ipcMain.on('clicked', (event, arg) => {
        let theta = {
          X: new LPS.Value(arg.x),
          Y: new LPS.Value(arg.y)
        };
        let observation = LPS.literal(arg.observation).substitute(theta);
        engine.observe(observation);
      });
      
      let updateTimingVariables = (t1, t2) => {
        let theta = {};
        if (t2 instanceof LPS.Variable) {
          let time1 = t1.evaluate();
          let time2 = new LPS.Value(time1 + 1);
          theta[t2.evaluate()] = time2;
        }
        return [ { theta: theta } ];
      };
      
      engine.define('draw_image', (id, x, y, width, height, imageId, t1, t2) => {
        let data = {
          id: id.evaluate(),
          x: x.evaluate(),
          y: y.evaluate(),
          width: width.evaluate(),
          height: height.evaluate(),
          imageId: imageId.evaluate()
        };
        sender.send('draw-image', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('show', (id, t1, t2) => {
        let data = {
          id: id.evaluate(),
          cycleInterval: engine.getCycleInterval()
        };
        sender.send('show-object', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('hide', (id, t1, t2) => {
        let data = {
          id: id.evaluate(),
          cycleInterval: engine.getCycleInterval()
        };
        sender.send('hide-object', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('flip_horizontal', (id, t1, t2) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('flip-horizontal', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('clear_flip_horizontal', (id, t1, t2) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('clear-flip-horizontal', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('set_flip_horizontal', (id, t1, t2) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('set-flip-horizontal', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('flip_vertical', (id, t1, t2) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('flip-vertical', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('clear_flip_vertical', (id, t1, t2) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('clear-flip-vertical', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('set_flip_vertical', (id, t1, t2) => {
        let data = {
          id: id.evaluate()
        };
        sender.send('set-flip-vertical', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('draw_circle', (id, x, y, radius, t1, t2) => {
        let data = {
          id: id.evaluate(),
          x: x.evaluate(),
          y: y.evaluate(),
          radius: radius.evaluate()
        };
        sender.send('draw-circle', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('move', (id, x, y, t1, t2) => {
        let data = {
          id: id.evaluate(),
          x: x.evaluate(),
          y: y.evaluate(),
          cycleInterval: engine.getCycleInterval()
        };
        sender.send('move', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('move_to', (id, x, y, t1, t2) => {
        let data = {
          id: id.evaluate(),
          x: x.evaluate(),
          y: y.evaluate()
        };
        sender.send('move-to', data);
        return updateTimingVariables(t1, t2);
      });
      
      engine.define('move_by', (id, x, y, t1, t2) => {
        let data = {
          id: id.evaluate(),
          x: x.evaluate(),
          y: y.evaluate(),
          cycleInterval: engine.getCycleInterval()
        };
        sender.send('move-by', data);
        return updateTimingVariables(t1, t2);
      });

      engine.on('postCycle', () => {
        sender.send('time-update', { time: engine.getCurrentTime() });
      });
      
      engine.on('done', () => {
        sender.send('done');
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
