import {Injectable} from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import {Participant} from '../participant';
import {environment} from '../../../../environments/environment';
import {getIceServers} from "../util/webrtc.utils"


@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private userId: string;
  private roomId: string;
  private rootElement: HTMLElement;

  private participants: Participant[] = [];

  private ws: WebSocketSubject<any>;

  private myPeerConnection?: RTCPeerConnection;

  constructor() {
  }

  async start(userId: string, roomId: string, rootElement: HTMLElement) {
    this.userId = userId;
    this.roomId = roomId;
    this.rootElement = rootElement;

    // connect to ws
    const protocol = environment.production ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${environment.apiHost}/ws`;
    console.log(`connecting to ${wsUrl}`);

    this.ws = new WebSocketSubject(wsUrl);

    // init ui
    this.initHtmlView();

    this.ws.subscribe(value => {
      this.handleMessage(value);
    });

    this.join();
    await this.sendSdpOffer();
    this.getParticipants();
  }


  initHtmlView(): void {
    this.rootElement.style.display = 'flex';
  }

  handleMessage(message: any): void {
    console.log(message);

    switch (message.type) {
      case 'participants':
        this.onParticipantsMessage(message.participantIds);
        break;
      case 'sdp-offer':
        this.onSdpOfferMessage(message.userId, message.sdpOffer);
        break;
      case 'sdp-answer':
        this.onSdpAnswerMessage(message.userId, message.sdpAnswer);
        break;
      case 'ice-candidate':
        this.onIceCandidateMessage(message.userId, message.candidate);
        break;
      default:
        console.error('Unrecognized message', message);
    }
  }

  private async onSdpOfferMessage(targetId: string, sdpOffer) {
    console.log('onSdpOfferMessage');

    const participant = this.participants.filter(value => value.userId == targetId)[0];

    const description: RTCSessionDescriptionInit = {'sdp': sdpOffer, 'type': 'offer'};

    await participant.connection.setRemoteDescription(new RTCSessionDescription(description));
    const answer = await participant.connection.createAnswer();
    await participant.connection.setLocalDescription(answer);

    const message = {
      type: 'sdp-answer',
      userId: this.userId,
      targetId: targetId,
      sdpAnswer: answer.sdp,
    };

    this.sendMessage(message);
  }

  private async onIceCandidateMessage(userId: string, candidate) {
    console.log('onIceCandidateMessage');

    if (userId == this.userId) {
      await this.myPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      return;
    }

    const participant = this.participants.filter(value => value.userId == userId)[0];
    await participant.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  async onSdpAnswerMessage(userId, sdpAnswer) {
    console.log('onSdpAnswerMessage')

    if (userId == this.userId) {
      const description: RTCSessionDescriptionInit = {'sdp': sdpAnswer, 'type': 'answer'};
      await this.myPeerConnection.setRemoteDescription(description)
    }
  }

  private onParticipantsMessage(participantIds: string[]) {
    console.log('onParticipantsMessage')

    console.log(`received participantIds: ${participantIds}`);

    let oldParticipantIds = this.participants.map(value => value.userId);
    oldParticipantIds.push(this.userId);

    let difference = participantIds.filter(x => !oldParticipantIds.includes(x));

    for (let participantId of difference) {
      this.addNewParticipant(participantId);
      this.sendGetVideoMessage(participantId);
    }

  }

  join() {
    console.log('join to room');

    const message = {
      type: 'join',
      userId: this.userId,
      roomId: this.roomId,
    };
    this.sendMessage(message);
  }

  getParticipants() {
    console.log('get participants');

    const message = {
      type: 'get-participants',
      userId: this.userId,
      roomId: this.roomId,
    };
    this.sendMessage(message);
  }

  async sendSdpOffer() {
    // create local connection
    this.myPeerConnection = new RTCPeerConnection({
      iceServers: getIceServers(),
    });

    // add tracks to peer connection
    let mediaStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    mediaStream.getTracks().forEach(track => this.myPeerConnection.addTrack(track));

    let videoElement: HTMLVideoElement = document.createElement('video');
    videoElement.height = 100;
    videoElement.width = 100;
    this.rootElement.appendChild(videoElement);


    this.myPeerConnection.onicecandidate = e => {
      const message = {
        type: 'ice-candidate',
        userId: this.userId,
        targetId: this.userId,
      };

      if (e.candidate) {
        message['candidate'] = e.candidate.candidate;
        message['sdpMid'] = e.candidate.sdpMid;
        message['sdpMLineIndex'] = e.candidate.sdpMLineIndex;
      }

      this.sendMessage(message);
    };

    videoElement.srcObject = mediaStream;

    let offer = await this.myPeerConnection.createOffer();
    await this.myPeerConnection.setLocalDescription(offer);


    const message = {
      type: 'sdp-offer',
      userId: this.userId,
      targetId: this.userId,
      sdpOffer: offer.sdp,
    };

    this.sendMessage(message);
  }

  dispose(): void {
    this.ws.complete();
  }

  sendMessage(message): void {
    console.log('sendMessage');
    console.log(`Sending message with type: ${message.type}`);
    this.ws.next(message);
  }

  private sendGetVideoMessage(targetId: string) {
    const message = {
      type: 'get-video',
      userId: this.userId,
      targetId: targetId,
    };
    this.sendMessage(message);
  }

  private addNewParticipant(participantId: string) {
    let videoElement: HTMLVideoElement = document.createElement('video');
    videoElement.height = 100;
    videoElement.width = 100;

    this.rootElement.appendChild(videoElement);

    const peerConnection = new RTCPeerConnection({iceServers: getIceServers()});
    peerConnection.onicecandidate = e => {
      const message = {
        type: 'ice-candidate',
        userId: this.userId,
        targetId: participantId,
      };

      if (e.candidate) {
        message['candidate'] = e.candidate.candidate;
        message['sdpMid'] = e.candidate.sdpMid;
        message['sdpMLineIndex'] = e.candidate.sdpMLineIndex;
      }

      this.sendMessage(message);
    };

    peerConnection.ontrack = ev => {
      console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
      console.log(ev)
      videoElement.autoplay = true;
      videoElement.srcObject = ev.streams[0];
      videoElement.height = 300;
      videoElement.width = 300;
    }

    const participant = new Participant(participantId, peerConnection);
    this.participants.push(participant);
  }


}
