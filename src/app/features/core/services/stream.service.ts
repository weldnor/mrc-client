import {Injectable} from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import {Participant} from '../participant';
import {environment} from '../../../../environments/environment';
import {getIceServers} from "../util/webrtc.utils";

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private userId: string;

  private roomId: string;
  private rootElement: HTMLElement;

  private ws: WebSocketSubject<any>;

  private participants = new Map<string, Participant>();

  constructor() {
  }

  public start(userId: string, roomId: string, rootElement: HTMLElement): void {
    console.log('start');

    this.userId = userId;
    this.roomId = roomId;
    this.rootElement = rootElement;

    // connect to ws
    const protocol = environment.production ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${environment.apiHost}/ws`;

    this.ws = new WebSocketSubject(wsUrl);

    this.initHtmlView();

    this.ws.subscribe(value => {
      this.handleMessage(value);
    });

    this.join();
  }

  public stop(): void {
    this.ws.complete();
  }

  private join(): void {
    console.log(`join to room with id: ${this.roomId}`);
    this.sendJoinMessage();
  }

  private handleMessage(message: any): void {
    console.log('handleMessage');

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
        throw new Error(`Unrecognized message: ${message}`);
    }
  }


  private async onSdpAnswerMessage(userId, sdpAnswer: any) {
    console.log('onReceiveVideoAnswer');

    const participant: Participant = this.participants[userId];
    const description: RTCSessionDescriptionInit = {sdp: sdpAnswer, type: "answer"};
    await participant.connection.setRemoteDescription(description);
  }

  private async onParticipantsMessage(participantIds) {
    console.log('onExistingParticipants');
    console.log(participantIds);

    // ограничения на исходящее видео
    const constraints = {video: true, audio: true}
    console.log(constraints);

    console.log(this.userId + ' registered in room ' + this.roomId);

    const localParticipant = await this.createLocalParticipant();
    this.participants[this.userId] = localParticipant;
    this.rootElement.appendChild(localParticipant.containerElement);

    // подключаем других участников
    for (const participantId of participantIds) {
      const participant = await this.createRemoteParticipant(participantId);

      this.participants[participantId] = participant;
      this.rootElement.appendChild(participant.containerElement);
    }
  }

  private onIceCandidateMessage(userId: any, candidate): void {
    this.participants[userId].connection.addIceCandidate(candidate);
  }

  private async createLocalParticipant() {
    const participant = new Participant(this.userId);

    participant.connection = new RTCPeerConnection({iceServers: getIceServers()});

    const mediaStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true})
    mediaStream.getTracks().forEach(value => participant.connection.addTrack(value, mediaStream));

    participant.connection.onicecandidate = ev => this.sendIceCandidateMessage(this.userId, ev.candidate);
    // participant.connection.ontrack = ev => participant.videoElement.srcObject = ev.streams[0];

    participant.videoElement.srcObject = mediaStream;

    const offer = await participant.connection.createOffer();
    await participant.connection.setLocalDescription(offer);
    this.sendGetVideoMessage(this.userId, offer)

    return participant;
  }

  private async createRemoteParticipant(userId: string) {
    const participant = new Participant(userId);

    participant.connection = new RTCPeerConnection({iceServers: getIceServers()});

    participant.connection.onicecandidate = ev => this.sendIceCandidateMessage(userId, ev.candidate);
    participant.connection.ontrack = ev => participant.videoElement.srcObject = ev.streams[0];

    const offer = await participant.connection.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true});
    await participant.connection.setLocalDescription(offer);

    this.sendGetVideoMessage(userId, offer)

    return participant;
  }


  private sendJoinMessage() {
    const message = {
      type: 'join',
      userId: this.userId,
      roomId: this.roomId,
    };
    this.sendMessage(message);
  }

  private sendIceCandidateMessage(targetId: string, candidate) {
    if (!candidate) {
      return;
    }

    const message = {
      type: 'ice-candidate',
      userId: this.userId,
      roomId: this.roomId,
      targetId: targetId,
    };

    if (candidate.candidate) {
      message['candidate'] = candidate.candidate;
      message['sdpMid'] = candidate.sdpMid;
      message['sdpMLineIndex'] = candidate.sdpMLineIndex;
    }
    this.sendMessage(message);
  }

  sendGetVideoMessage(targetId: string, sdpOffer): void {
    const msg = {
      type: 'get-video',
      userId: this.userId,
      roomId: this.roomId,
      targetId: targetId,
      sdpOffer: sdpOffer.sdp
    };
    this.sendMessage(msg);
  }

  sendMessage(message): void {
    this.ws.next(message);
  }

  initHtmlView(): void {
    this.rootElement.style.display = 'flex';
  }
}
