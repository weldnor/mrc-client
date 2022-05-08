const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  processControlCommand: (command) => ipcRenderer.send('command', command)
})
