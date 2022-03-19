import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../../features/core/services/user.service';
import {User} from '../../../../features/core/models/user.model';
import {RoomService} from "../../../../features/core/services/room.service";
import {Room} from "../../../../features/core/models/room.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {

  users: User[] = [];
  rooms: Room[] = [];

  constructor(
    private readonly userService: UserService,
    private readonly roomService: RoomService,
  ) {
  }

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(value => {
      this.users = value;
    });

    this.roomService.getAllRooms().subscribe(rooms => {
      this.rooms = rooms;
    });
  }

}
