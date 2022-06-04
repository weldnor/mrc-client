// In the preload script.
const {ipcRenderer} = require('electron')

let stream;

ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
  stream = navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
        minWidth: 1280,
        maxWidth: 1280,
        minHeight: 720,
        maxHeight: 720
      }
    }
  })
})


window.electronAPI = {
  async getDisplayMedia() {
    return stream;
  }
}
