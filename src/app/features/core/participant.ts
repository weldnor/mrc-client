import {WebSocketSubject} from 'rxjs/internal-compatibility';
import {WebRtcPeer} from 'kurento-utils';


export class Participant {

  container: HTMLElement;
  video: HTMLVideoElement;
  rtcPeer: WebRtcPeer;


  constructor(
    private readonly userId: string,
    private readonly ws: WebSocketSubject<any>,
    private readonly localUserId: string,
  ) {
    this.createHtmlView();
  }

  createHtmlView(): void {
    const container = document.createElement('div');

    container.id = String(this.userId);
    // container.style.display = 'flex';
    // container.style.flexDirection = 'column';
    container.style.width = '300px';
    container.style.height = '200px';
    container.style.position = 'relative';


    const span = document.createElement('span');
    const video = document.createElement('video');

    video.id = 'video-' + this.userId;
    video.autoplay = true;
    video.controls = false;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'fill';

    span.style.position = 'absolute';
    span.style.top = '0px';
    span.style.left = '0px';
    span.style.zIndex = '2';
    span.textContent = String(this.userId);
    span.style.textAlign = 'center';
    span.style.padding = '2px';
    span.style.backgroundColor = 'black';
    span.style.color = 'white';
    span.style.opacity = '0.3'; /* Прозрачность слоя */

    container.appendChild(span);
    container.appendChild(video);

    this.container = container;
    this.video = video;
  }

  offerToReceiveVideo(error, offerSdp): void {
    console.log('offerToReceiveVideo');

    if (error) {
      return console.error('sdp offer error');
    }
    console.log('Invoking SDP offer callback function');
    const msg = {
      type: 'get-video',
      userId: this.localUserId,
      targetId: this.userId,
      sdpOffer: offerSdp
    };
    this.sendMessage(msg);
  }

  onIceCandidate(candidate): void {
    console.log('onIceCandidate');
    const message = {
      type: 'ice-candidate',
      userId: this.localUserId,
      targetId: this.userId
    };

    if (candidate.candidate) {
      message['candidate'] = candidate.candidate;
      message['sdpMid'] = candidate.sdpMid;
      message['sdpMLineIndex'] = candidate.sdpMLineIndex;
    }
    this.sendMessage(message);
  }


  sendMessage(message): void {
    console.log('sendMessage');
    console.log('Sending message: ' + JSON.stringify(message));
    this.ws.next(message);
  }

  dispose(): void {
    this.container.remove();
    this.rtcPeer.dispose();
  }

}
