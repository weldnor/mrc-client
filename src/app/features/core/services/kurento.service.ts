import {Injectable} from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import * as kurentoUtils from 'kurento-utils';
import {Participant} from '../participant';
import {environment} from '../../../../environments/environment';
import {interval, Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KurentoService {
  private userId: number;

  private roomId: number;
  private rootElement: HTMLElement;

  private ws: WebSocketSubject<any>;

  private participants = new Map<number, Participant>();
  private zoomedParticipant: Participant | undefined;

  private timerSubscription: Subscription;

  constructor() {
  }

  start(userId: number, roomId: number, rootElement: HTMLElement): void {
    console.log('start');

    // connect to ws
    const protocol = environment.production ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${environment.apiHost}/ws`;

    this.ws = new WebSocketSubject(wsUrl);

    this.timerSubscription = interval(10000).subscribe(() => {
      this.sendMessage({id: 'ping'});
    });

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
    this.timerSubscription.unsubscribe();
    this.ws.complete();
  }

  initHtmlView(): void {
    this.rootElement.style.display = 'flex';
  }

  handleMessage(message: any): void {
    console.log('handleMessage');

    switch (message.id) {
      case 'existingParticipants':
        this.onExistingParticipants(message);
        break;
      case 'newParticipantArrived':
        this.onNewParticipantArrived(message);
        break;
      case 'participantLeft':
        this.onParticipantLeft(message);
        break;
      case 'receiveVideoAnswer':
        this.onReceiveVideoAnswer(message);
        break;
      case 'iceCandidate':
        this.onIceCandidate(message);
        break;
      case 'pong':
        this.onPong();
        break;
      default:
        console.error('Unrecognized message', message);
    }
  }

  joinRoom(): void {
    console.log('register');
    const message = {
      id: 'joinRoom',
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

  onReceiveVideoAnswer(result): void {
    console.log('onReceiveVideoAnswer');
    console.log(this.participants);
    console.log(result);
    this.participants[result.userId].rtcPeer.processAnswer(result.sdpAnswer, error => {
      if (error) {
        return console.error(error);
      }
    });
  }

  onExistingParticipants(msg): void {
    console.log('onExistingParticipants');
    console.log(msg);

    // ограничения на исходящее видео
    const constraints = {
      audio: true,
      video: {
        mandatory: {
          maxWidth: 320,
          maxFrameRate: 15,
          minFrameRate: 15
        }
      }
    };

    console.log(this.userId + ' registered in room ' + this.roomId);

    const participant = new Participant(this.userId, this.ws, this);
    this.participants[this.userId] = participant;

    this.rootElement.appendChild(participant.container);

    console.log(participant.video)

    const options = {
      localVideo: participant.video,
      mediaConstraints: constraints,
      onicecandidate: participant.onIceCandidate.bind(participant)
    };

    participant.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
      function(error): void {
        if (error) {
          return console.error(error);
        }
        this.generateOffer(participant.offerToReceiveVideo.bind(participant));
      });

    // подключаем других участников
    for (const userId of msg.data) {
      this.receiveVideoFrom(userId);
    }
  }


  leaveRoom(): void {
    console.log('leaveRoom');
    this.sendMessage({
      id: 'leaveRoom'
    });

    // tslint:disable-next-line:forin
    for (const key in this.participants) {
      this.participants[key].dispose();
    }

    this.ws.complete(); // ?
  }

  receiveVideoFrom(userId): void {
    console.log('receiveVideo');
    const participant = new Participant(userId, this.ws, this);
    this.participants[userId] = participant;

    this.rootElement.appendChild(participant.container);

    const options = {
      remoteVideo: participant.video,
      onicecandidate: participant.onIceCandidate.bind(participant)
    };

    participant.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
      function(error): void {
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

  onIceCandidate(message: any): void {
    const userId = message.userId;
    const candidate = message.candidate;
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

  onZoom(participant: Participant): void {
    if (this.zoomedParticipant) {
      this.zoomedParticipant.zoomOut();
    }
    this.zoomedParticipant = participant;
    participant.zoomIn();
  }
}
