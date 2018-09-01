import { ipcMain } from 'electron';
import studioEngineLoader from './studioEngineLoader';
import * as LPS from 'lps';
import * as path from 'path';

let engines = {};

ipcMain.on('lps:start', (event, arg) => {
  let sender = event.sender;
  let windowId = arg.windowId;
  let programPathname = arg.pathname;
  let programPath = path.dirname(programPathname);

  let onEngineHalted = () => {
    delete engines[windowId];
    sender.send('canvas:lpsHalted');
  };

  LPS.createFromFile(programPathname)
    .then((engine) => {
      return studioEngineLoader(engine, programPath, sender);
    })
    .then((engine) => {
      let profiler = engine.getProfiler();
      engines[windowId] = engine;
      engine.on('paused', () => {
        sender.send('canvas:lpsPaused');
      });

      engine.on('unpaused', () => {
        sender.send('canvas:lpsUnpaused');
      });

      engine.on('warning', (err) => {
        sender.send('canvas:lpsWarning', err);
      });

      engine.on('error', (err) => {
        sender.send('canvas:lpsErrorred', err.message);
        onEngineHalted();
      });

      engine.on('postCycle', () => {
        sender.send('canvas:lpsTimeUpdate', {
          time: engine.getCurrentTime(),
          numNewRules: profiler.get('lastCycleNumNewRules'),
          numRulesFired: profiler.get('lastCycleNumFiredRules'),
          numRulesDiscarded: profiler.get('lastCycleNumDiscardedRules'),
          numRules: profiler.get('numRules')
        });
      });

      engine.on('done', () => {
        onEngineHalted();
      });

      sender.send('canvas:lpsStart', '');
      engine.run();
    })
    .catch((err) => {
      sender.send('canvas:lpsErrorred', err.message);
      onEngineHalted();
    });
});

let getEngine = function getEngine(arg) {
  let engine = engines[arg.windowId];
  if (engine === undefined) {
    return null;
  }
  return engine;
}

ipcMain.on('lps:halt', (event, arg) => {
  let engine = getEngine(arg);
  if (engine === null) {
    return;
  }
  engine.halt();
  delete engines[arg.windowId];
});

ipcMain.on('lps:pause', (event, arg) => {
  let engine = getEngine(arg);
  if (engine === null) {
    return;
  }
  engine.pause();
});

ipcMain.on('lps:unpause', (event, arg) => {
  let engine = getEngine(arg);
  if (engine === null) {
    return;
  }
  engine.unpause();
});

ipcMain.on('lps:observe', (event, arg) => {
  let engine = getEngine(arg);
  if (engine === null) {
    return;
  }
  let observation = LPS.literalSet(arg.input);
  engine.observe(observation);
});
