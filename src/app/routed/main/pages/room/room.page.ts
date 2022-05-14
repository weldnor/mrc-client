import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {StreamService} from "../../../../features/core/services/stream.service";
import {AuthService} from "../../../../features/core/services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss']
})
export class RoomPage implements AfterViewInit {

  @ViewChild('root') rootElement!: ElementRef;

  private roomId?: string;
  private userId?: string;

  constructor(
    private readonly streamService: StreamService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {

  }

  async ngAfterViewInit() {
    this.userId = this.authService.getUserId();
    this.roomId = this.route.snapshot.paramMap.get('bank');

    await this.streamService.start(this.userId, this.roomId, this.rootElement.nativeElement);
  }

  onParticipantButtonClick() {
    // todo
  }

  onCameraButtonClick() {
    // todo
  }

  onMicrophoneButtonClick() {
    // todo
  }

  onShareScreenButtonClick() {
    // todo
  }

  async onLeaveButtonClick() {
    this.streamService.stop();
    await this.router.navigateByUrl("/home");
  }
}
