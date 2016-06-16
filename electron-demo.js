const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');

app.mainRenderer = null;

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  app.mainRenderer = new BrowserWindow({
    width: 1200,
    height: 800,
    minHeight: 650,
    minWidth: 800
  });

  app.mainRenderer.loadURL('file://' + path.join(__dirname, 'electron-demo.html'));

  app.mainRenderer.webContents.openDevTools();

  app.mainRenderer.on('closed', () => {
    app.mainRenderer = null;
  });
});
