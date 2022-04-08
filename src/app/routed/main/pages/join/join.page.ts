import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MediaDevicesService} from "../../../../features/core/services/media-devices.service";

@Component({
  selector: 'app-join',
  templateUrl: './join.page.html',
  styleUrls: ['./join.page.scss']
})
export class JoinPage implements OnInit {

  roomId?: number

  audioDevices = []
  videoDevices = []

  constructor(
    private readonly mediaDevicesService: MediaDevicesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
  }

  ngOnInit(): void {
    this.roomId = this.route.snapshot.params['id'];

    this.start();
  }

  async start() {
    this.audioDevices = await this.mediaDevicesService.getMediaDevices();
    console.log(this.audioDevices);
    this.videoDevices = await this.mediaDevicesService.getVideoDevices();
    console.log(this.videoDevices);
  }

  async onJoinButtonClick() {
    await this.router.navigateByUrl(`/rooms/${this.roomId}`, {skipLocationChange: true});
  }

  async selectAudioDevice(device: MediaDeviceInfo) {
    this.mediaDevicesService.selectedAudioDevice = device;
  }

  async selectVideoDevice(device: MediaDeviceInfo) {
    this.mediaDevicesService.selectedVideoDevice = device;
  }
}
