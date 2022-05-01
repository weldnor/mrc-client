export class Participant {

  constructor(
    readonly userId: string,
    readonly connection: RTCPeerConnection,
    readonly videoElement: HTMLVideoElement,
  ) {
  }

}
