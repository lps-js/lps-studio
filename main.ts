import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import * as LPS from 'lps';
import createMainWindow from './main/createMainWindow';
import { getNumOfMainWindow } from './main/createMainWindow';
import createLicenseWindow from './main/createLicenseWindow';
import './main/engineManager';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

// const firstRunFile = path.join(app.getPath('userData'), 'firstRun');
// const checkIfFirstRun = function () {
//   let result = fs.existsSync(firstRunFile);
//   if (result) {
//     return false;
//   }
//   fs.writeFileSync(firstRunFile, '');
//   return true;
// };

ipcMain.on('app:openLicenseWindow', () => {
  createLicenseWindow();
});

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    createMainWindow();
    // const isFirstRun = checkIfFirstRun();
    // if (isFirstRun) {
    //
    // }
  });

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
    if (process.platform === 'darwin' && getNumOfMainWindow() === 0) {
      createMainWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
