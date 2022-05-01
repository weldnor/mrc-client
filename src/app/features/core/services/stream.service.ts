import {Injectable} from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import * as kurentoUtils from 'kurento-utils';
import {Participant} from '../participant';
import {environment} from '../../../../environments/environment';
import {getMediaConstraints} from "../util/webrtc.utils";

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


  private onSdpAnswerMessage(userId, sdpAnswer: any): void {
    console.log('onReceiveVideoAnswer');
    console.log(this.participants);
    this.participants[userId].rtcPeer.processAnswer(sdpAnswer, error => {
      if (error) {
        return console.error(error);
      }
    });
  }

  private onParticipantsMessage(participantIds): void {
    console.log('onExistingParticipants');
    console.log(participantIds);

    // ограничения на исходящее видео
    const constraints = {video: true, audio: true}
    console.log(constraints);

    console.log(this.userId + ' registered in room ' + this.roomId);

    const localParticipant = this.createLocalParticipant();
    this.participants[this.userId] = localParticipant;
    this.rootElement.appendChild(localParticipant.containerElement);

    // подключаем других участников
    for (const participantId of participantIds) {
      const participant = this.createRemoteParticipant(participantId);

      this.participants[participantId] = participant;
      this.rootElement.appendChild(participant.containerElement);
    }
  }

  private onIceCandidateMessage(userId: any, candidate): void {
    this.participants[userId].rtcPeer.addIceCandidate(candidate, error => {
      if (error) {
        console.error('Error adding candidate: ' + error);
        return;
      }
    });
  }

  private createLocalParticipant(): Participant {
    const participant = new Participant(this.userId);

    const options = {
      localVideo: participant.videoElement,
      mediaConstraints: getMediaConstraints(),
      onicecandidate: (candidate) => this.sendIceCandidateMessage(this.userId, candidate),
    };

    participant.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, error => {
        if (error) {
          return console.error(error);
        }
        participant.rtcPeer.generateOffer((error, sdp) => this.sendGetVideoMessage(this.userId, sdp));
      }
    );

    return participant;
  }

  private createRemoteParticipant(userId: string) {
    const participant = new Participant(userId);

    const options = {
      remoteVideo: participant.videoElement,
      onicecandidate: (candidate) => this.sendIceCandidateMessage(userId, candidate),
    };

    participant.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, error => {
      if (error) {
        return console.error(error);
      }
      participant.rtcPeer.generateOffer((error, sdp) => this.sendGetVideoMessage(userId, sdp));
    });

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
    const message = {
      type: 'ice-candidate',
      userId: this.userId,
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
      targetId: targetId,
      sdpOffer: sdpOffer
    };
    this.sendMessage(msg);
  }

  sendMessage(message): void {
    console.log('sendMessage');
    console.log(`Sending message with id: ${message.id}`);
    this.ws.next(message);
  }

  initHtmlView(): void {
    this.rootElement.style.display = 'flex';
  }
}
