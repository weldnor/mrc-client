import {Injectable} from '@angular/core';
import {WebsocketService} from "./websocket.service";
import {AuthService} from "./auth.service";
import {interval, Subscription} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StreamService {

  // private roomId: string;
  // private readonly currentUserId: string;
  //
  // private timerSubscription: Subscription;
  // private websocketSubscription: Subscription;
  //
  // constructor(
  //   private readonly websocketService: WebsocketService,
  //   private readonly AuthService: AuthService,
  // ) {
  //
  //   this.currentUserId = this.AuthService.getUserId();
  // }
  //
  // start(roomId: string): void {
  //   this.roomId = roomId;
  //
  //   this.websocketService.sendMessage({type: "join", userId: this.currentUserId})
  //
  //   this.websocketSubscription = this.websocketService.subscribe(message => {
  //     this.handleMessage(message);
  //   });
  //
  //   this.timerSubscription = interval(1000).subscribe(() => {
  //     this.websocketService.sendMessage({type: 'ping'});
  //   });
  // }
  //
  // private handleMessage(message: any) {
  //   console.log(message);
  // }
  //
  // stop(): void {
  //   this.websocketService.sendMessage({type: "leave", userId: this.currentUserId});
  //
  //   this.timerSubscription.unsubscribe();
  //   this.websocketSubscription.unsubscribe();
  // }

}
