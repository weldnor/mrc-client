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

  private zoomedParticipantId?


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
      void this.handleMessage(value);
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

  private async handleMessage(message: any) {
    console.log('handleMessage');

    switch (message.type) {
      case 'participants':
        await this.onParticipantsMessage(message.participantIds);
        break;
      case 'participants/left':
        this.onParticipantsLeftMessage(message.userId);
        break;
      case 'participants/new':
        await this.onParticipantsNewMessage(message.userId);
        break;
      case 'sdp-answer':
        await this.onSdpAnswerMessage(message.userId, message.sdpAnswer);
        break;
      case 'ice-candidate':
        await this.onIceCandidateMessage(message.userId, message.candidate);
        break;
      default:
        throw new Error(`Unrecognized message: ${message}`);
    }
  }


  private async onSdpAnswerMessage(userId, sdpAnswer: any) {
    console.log('onReceiveVideoAnswer');

    const participant: Participant = this.participants.get(userId);
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
    this.participants.set(this.userId, localParticipant);
    this.rootElement.appendChild(localParticipant.containerElement);

    // подключаем других участников
    for (const participantId of participantIds) {
      const participant = await this.createRemoteParticipant(participantId);

      this.participants.set(participantId, participant);
      this.rootElement.appendChild(participant.containerElement);
    }
  }

  private async onIceCandidateMessage(userId: any, candidate) {
    await this.participants.get(userId).connection.addIceCandidate(candidate);
  }

  private onParticipantsLeftMessage(userId: string) {
    const participant: Participant = this.participants.get(userId);
    participant.connection.close();
    participant.containerElement.parentElement.removeChild(participant.containerElement);
    participant.videoElement.parentElement.removeChild(participant.videoElement);
    this.participants.delete(userId);
  }

  private async onParticipantsNewMessage(userId: string) {
    const participant = await this.createRemoteParticipant(userId);

    this.participants.set(userId, participant);
    this.rootElement.appendChild(participant.containerElement);
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

    participant.videoElement.onclick = () => {
      this.updateZoomState(participant.userId);
    }

    participant.connection = new RTCPeerConnection({iceServers: getIceServers()});

    participant.connection.onicecandidate = ev => this.sendIceCandidateMessage(userId, ev.candidate);
    participant.connection.ontrack = ev => participant.videoElement.srcObject = ev.streams[0];

    const offer = await participant.connection.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true});
    await participant.connection.setLocalDescription(offer);

    this.sendGetVideoMessage(userId, offer)

    return participant;
  }

  updateZoomState(participantId: string): void {
    if (this.zoomedParticipantId) {
      this.unzoom(participantId);
      return;
    }
    this.zoom(participantId);
  }

  private zoom(participantId: string) {
    console.log("zoom")

    this.zoomedParticipantId = participantId;
    this.sendZoomMessage(participantId, false);

    for (let participant of this.participants.values()) {

      if (participant.userId == participantId) {

        participant.containerElement.style.width = "100%";
        participant.containerElement.style.height = "auto";
      } else {
        participant.containerElement.hidden = true;
      }
    }


  }

  private unzoom(participantId: string) {
    console.log("unzoom")

    this.zoomedParticipantId = null;
    this.sendZoomMessage(participantId, true);

    for (let participant of this.participants.values()) {
      if (participant.userId === participantId) {
        participant.containerElement.style.width = '300px';
        participant.containerElement.style.height = '200px';
      } else {
        participant.containerElement.hidden = false;
      }
    }
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

  sendZoomMessage(targetId: string, state: boolean) {
    const msg = {
      type: 'zoom',
      userId: this.userId,
      roomId: this.roomId,
      targetId: targetId,
      enabled: state,
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
