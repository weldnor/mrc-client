import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MediaDevicesService {

  private _selectedVideoDevice?: MediaDeviceInfo;
  private _selectedAudioDevice?: MediaDeviceInfo;

  constructor() {
  }

  async getDevices() {
    return await navigator.mediaDevices.enumerateDevices();
  }

  async getMediaDevices() {
    let devices = await this.getDevices();
    return devices.filter(device => device.kind == 'audioinput');
  }

  async getVideoDevices() {
    let devices = await this.getDevices();
    return devices.filter(device => device.kind == 'videoinput');
  }

  get selectedAudioDevice(): MediaDeviceInfo {
    return this._selectedAudioDevice;
  }

  set selectedAudioDevice(device: MediaDeviceInfo) {
    console.debug(`selected audio device with id: ${device.deviceId}`);
    this._selectedAudioDevice = device;
  }

  get selectedVideoDevice(): MediaDeviceInfo {
    return this._selectedVideoDevice;
  }

  set selectedVideoDevice(device: MediaDeviceInfo) {
    console.debug(`selected video device with id: ${device.deviceId}`);
    this._selectedVideoDevice = device;
  }
}
