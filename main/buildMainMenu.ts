import { app, Menu, MenuItemConstructorOptions, shell, BrowserWindow } from 'electron';
import createMainWindow from './createMainWindow';
import createAboutWindow from './createAboutWindow';
import createLicenseWindow from './createLicenseWindow';

const REPORT_ISSUE_URL = 'https://github.com/mauris/lps-studio/issues';

export default function buildMainMenu() {
  let menuTemplate: MenuItemConstructorOptions[] = [];

  let aboutMenuItem: MenuItemConstructorOptions = {
    label: 'About LPS Studio',
    click() {
      createAboutWindow();
    }
  };

  if (process.platform === 'darwin') {
    // for macOS
    menuTemplate.push({
      label: 'Menu',
      submenu: [
        aboutMenuItem,
        {
          label: 'View License',
          click() {
            createLicenseWindow();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Cmd+Q',
          click() {
            app.quit()
          }
        }
      ]
    });
  }

  let fileMenu: MenuItemConstructorOptions[] = [
    {
      label: 'New Window',
      accelerator: 'CmdOrCtrl+N',
      click() {
        createMainWindow();
      }
    },
    {
      label: 'Open...',
      accelerator: 'CmdOrCtrl+O',
      click() {
        let focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow === null) {
          return;
        }
        focusedWindow.webContents.send('canvas:openFile');
      }
    },
    { type: 'separator' },
    {
      label: 'Close Window',
      accelerator: 'CmdOrCtrl+W',
      click() {
        let focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow === null) {
          return;
        }
        focusedWindow.close();
      }
    },
    {
      label: 'Close All Windows',
      click() {
        let windows = BrowserWindow.getAllWindows();
        windows.forEach((window) => {
          window.close();
        });
      }
    }
  ];


  if (process.platform !== 'darwin') {
    fileMenu.push({ type: 'separator' });
    fileMenu.push({
      label: 'Quit',
      accelerator: 'Alt+F4',
      click() {
        app.quit()
      }
    });
  }

  menuTemplate.push({
    label: 'File',
    submenu: fileMenu
  });

  // help menu
  if (process.platform === 'darwin') {
    // for macOS
    menuTemplate.push({
      label: 'Help',
      submenu: [
        {
          label: 'Welcome Guide'
        },
        {
          label: 'Report Issue',
          click() {
            shell.openExternal(REPORT_ISSUE_URL)
          }
        }
      ]
    });
  } else {
    menuTemplate.push({
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Welcome Guide'
        },
        {
          label: 'Report Issue',
          click() {
            shell.openExternal(REPORT_ISSUE_URL)
          }
        },
        { type: 'separator' },
        {
          label: 'View License',
          click() {
            createLicenseWindow();
          }
        },
        aboutMenuItem
      ]
    });
  }
  // help menu

  return Menu.buildFromTemplate(menuTemplate)
}
