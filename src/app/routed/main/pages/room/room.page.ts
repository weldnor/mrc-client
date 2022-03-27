import {Component, OnDestroy, OnInit} from '@angular/core';
import {RoomService} from "../../../../features/core/services/room.service";
import {StreamService} from "../../../../features/core/services/stream.service";
import {ActivatedRoute} from "@angular/router";
import {WebsocketService} from "../../../../features/core/services/websocket.service";

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss']
})
export class RoomPage implements OnInit, OnDestroy {

  roomId: string;

  constructor(
    private readonly roomService: RoomService,
    private readonly streamService: StreamService,
    private readonly route: ActivatedRoute,
    private readonly websocketService: WebsocketService,
  ) {
  }

  async ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('id');

    let client = await this.websocketService.getClient();
    client.subscribe("/queue/test", message => {
      console.log(message.body);
    })

    client.send("/app/test/echo", {}, "hello world!");
  }

  ngOnDestroy(): void {
    // nothing there
  }
}
