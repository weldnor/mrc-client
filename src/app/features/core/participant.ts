export class Participant {

  constructor(
    readonly userId: string,
    readonly connection: RTCPeerConnection,
  ) {
  }

}
