const {app, BrowserWindow, ipcMain, desktopCapturer} = require("electron");
const path = require("path");
const url = require("url");
const robot = require("robotjs");

let browserWindow;

function createBrowserWindow() {
  browserWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  browserWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '/dist/mrc-client/index.html'),
      protocol: "file:",
      slashes: true
    })
  );

  browserWindow.on("closed", () => {
    browserWindow = null;
  });

  desktopCapturer.getSources({ types: ['screen'] }).then(async sources => {
    console.log(sources)
    browserWindow.webContents.send('SET_SOURCE', sources[0].id);
  })
}

function handleCommandMessage(event, message) {
  console.log(message);
  robot.moveMouse(message.x, message.y);
}

app.on("ready", () => {
  ipcMain.on('command', handleCommandMessage);
  createBrowserWindow();
});

app.on("activate", () => {
  if (browserWindow === null) {
    createBrowserWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
