import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {KurentoService} from "../../../../features/core/services/kurento.service";

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss']
})
export class RoomPage implements AfterViewInit {

  @ViewChild('root') rootElement!: ElementRef;
  userIdForm = new FormControl('');
  // private userId = 1;
  private roomId = 1;

  constructor(
    private readonly kurentoService: KurentoService
  ) {

  }


  ngAfterViewInit(): void {

  }

  onConnectButtonClick(): void {
    const userId = +this.userIdForm.value;
    this.kurentoService.start(userId, this.roomId, this.rootElement.nativeElement);
  }
}
