import {Injectable} from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import * as kurentoUtils from 'kurento-utils';
import {Participant} from '../participant';
import {environment} from '../../../../environments/environment';
import {MediaDevicesService} from "./media-devices.service";

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private userId: string;

  private roomId: string;
  private rootElement: HTMLElement;

  private ws: WebSocketSubject<any>;

  private participants = new Map<string, Participant>();
  private zoomedParticipant: Participant | undefined;


  constructor(
    private readonly mediaDevicesService: MediaDevicesService,
  ) {
  }

  start(userId: string, roomId: string, rootElement: HTMLElement): void {
    console.log('start');

    // connect to ws
    const protocol = environment.production ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${environment.apiHost}/ws`;

    console.log(wsUrl);

    this.ws = new WebSocketSubject(wsUrl);

    this.userId = userId;
    this.roomId = roomId;
    this.rootElement = rootElement;

    this.initHtmlView();

    this.ws.subscribe(value => {
      this.handleMessage(value);
    });

    this.joinRoom();
  }

  dispose(): void {
    this.ws.complete();
  }

  initHtmlView(): void {
    this.rootElement.style.display = 'flex';
  }

  handleMessage(message: any): void {
    console.log('handleMessage');

    switch (message.type) {
      case 'participants':
        this.onExistingParticipants(message.participantIds);
        break;
      case 'sdp-answer':
        this.onReceiveVideoAnswer(message.userId, message.sdpAnswer);
        break;
      case 'ice-candidate':
        this.onIceCandidate(message.userId, message.candidate);
        break;
      default:
        console.error('Unrecognized message', message);
    }
  }

  joinRoom(): void {
    console.log('register');
    const message = {
      type: 'join',
      userId: this.userId,
      roomId: this.roomId,
    };
    console.log(message);
    this.sendMessage(message);
  }

  onNewParticipantArrived(request): void {
    console.log('onNewParticipantArrived');
    this.receiveVideoFrom(request.userId);
  }

  onReceiveVideoAnswer(userId, sdpAnswer: any): void {
    console.log('onReceiveVideoAnswer');
    console.log(this.participants);
    this.participants[userId].rtcPeer.processAnswer(sdpAnswer, error => {
      if (error) {
        return console.error(error);
      }
    });
  }

  onExistingParticipants(participantIds): void {
    console.log('onExistingParticipants');
    console.log(participantIds);

    // ограничения на исходящее видео
    const constraints = {video: true, audio: true}
    console.log(constraints);

    console.log(this.userId + ' registered in room ' + this.roomId);

    const participant = new Participant(this.userId, this.ws, this.userId);
    this.participants[this.userId] = participant;

    this.rootElement.appendChild(participant.container);

    console.log(participant.video)

    const options = {
      localVideo: participant.video,
      mediaConstraints: constraints,
      onicecandidate: participant.onIceCandidate.bind(participant)
    };

    participant.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
      function (error): void {
        if (error) {
          return console.error(error);
        }
        this.generateOffer(participant.offerToReceiveVideo.bind(participant));
      });

    // подключаем других участников
    for (const participantId of participantIds) {
      this.receiveVideoFrom(participantId);
    }
  }


  receiveVideoFrom(userId): void {
    console.log('receiveVideo');
    const participant = new Participant(userId, this.ws, this.userId);
    this.participants[userId] = participant;

    this.rootElement.appendChild(participant.container);

    const options = {
      remoteVideo: participant.video,
      onicecandidate: participant.onIceCandidate.bind(participant)
    };

    participant.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
      function (error): void {
        if (error) {
          return console.error(error);
        }
        this.generateOffer(participant.offerToReceiveVideo.bind(participant));
      });

  }

  onParticipantLeft(request): void {
    const userId = request.userId;
    console.log('onParticipantLeft');
    console.log('Participant ' + userId + ' left');
    this.deleteParticipant(userId);
  }

  deleteParticipant(userId: number): void {
    const participant = this.participants[userId];
    participant.dispose();
    delete this.participants[userId];
  }

  onIceCandidate(userId: any, candidate): void {
    this.participants[userId].rtcPeer.addIceCandidate(candidate, error => {
      if (error) {
        console.error('Error adding candidate: ' + error);
        return;
      }
    });
  }

  onPong(): void {
    console.debug('pong!');
  }

  sendMessage(message): void {
    console.log('sendMessage');
    console.log(`Sending message with id: ${message.id}`);
    this.ws.next(message);
  }

}
