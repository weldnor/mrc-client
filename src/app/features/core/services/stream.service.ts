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

  private participants = new Map<string, Participant>();

  private ws: WebSocketSubject<any>;


  constructor() {
  }

  async start(userId: string, roomId: string, rootElement: HTMLElement) {
    this.userId = userId;
    this.roomId = roomId;
    this.rootElement = rootElement;

    // connect to ws
    const protocol = environment.production ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${environment.apiHost}/ws`;

    this.ws = new WebSocketSubject(wsUrl);

    // init ui
    this.initHtmlView();

    this.ws.subscribe(value => {
      this.handleMessage(value);
    });

    this.sendJoinMessage();
  }

  dispose(): void {
    this.ws.complete();
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

  private async onIceCandidateMessage(userId: string, candidate) {
    console.log('onIceCandidateMessage');
    const participant = this.participants[userId];
    await participant.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  async onSdpAnswerMessage(userId, sdpAnswer) {
    console.log('onSdpAnswerMessage')
    const description: RTCSessionDescriptionInit = {'sdp': sdpAnswer, 'type': 'answer'};
    const participant = this.participants[userId];
    await participant.connection.setRemoteDescription(description);
  }

  private async onParticipantsMessage(participantIds: string[]) {
    console.log('onParticipantsMessage')

    // 1. add local participant
    const localParticipant = this.createParticipant(this.userId);

    const mediaStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    mediaStream.getTracks().forEach(track => localParticipant.connection.addTrack(track, mediaStream));

    this.rootElement.appendChild(localParticipant.videoElement);
    this.participants[this.userId] = localParticipant;

    // 2.
    for (let participantId of participantIds) {
      console.log(participantId);
      let participant;
      if (participantId != this.userId) {
        participant = this.createParticipant(participantId);
        this.rootElement.appendChild(participant.videoElement);
        this.participants[participantId] = participant;
      } else {
        participant = localParticipant;
      }
      let offer = await participant.connection.createOffer();
      console.log(offer);
      await participant.connection.setLocalDescription(offer);
      await this.sendGetVideoMessage(participantId, offer.sdp);
    }

  }

  sendJoinMessage() {
    console.log(`join to room with id: ${this.roomId}`);

    const message = {
      type: 'join',
      userId: this.userId,
      roomId: this.roomId,
    };
    this.sendMessage(message);
  }


  private createParticipant(participantId: string) {
    // create ui element
    let videoElement: HTMLVideoElement = document.createElement('video');
    videoElement.height = 100;
    videoElement.width = 200;
    videoElement.autoplay = true;
    videoElement.controls = false;

    const connection = new RTCPeerConnection({iceServers: getIceServers()});

    
    // add event listeners
    connection.onicecandidate = e => {
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

    connection.ontrack = async ev => videoElement.srcObject = ev.streams[0]

    return new Participant(participantId, connection, videoElement);
  }


  private async sendGetVideoMessage(targetId, sdpOffer) {
    const message = {
      type: 'get-video',
      userId: this.userId,
      targetId: targetId,
      sdpOffer: sdpOffer,
    };
    this.sendMessage(message);
  }

  sendMessage(message: any): void {
    console.log('sendMessage');
    console.log(`Sending message with type: ${message.type}`);
    this.ws.next(message);
  }
}
