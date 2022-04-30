import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {StreamService} from "../../../../features/core/services/stream.service";

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss']
})
export class RoomPage implements AfterViewInit {

  @ViewChild('root') rootElement!: ElementRef;
  userIdForm = new FormControl('');

  private readonly roomId = "1";

  constructor(
    private readonly kurentoService: StreamService
  ) {

  }


  ngAfterViewInit(): void {

  }

  async onConnectButtonClick() {
    const userId = this.userIdForm.value;
    await this.kurentoService.start(userId, this.roomId, this.rootElement.nativeElement);
  }
}
