import {Component, OnInit} from '@angular/core';
import {User} from '../../../../features/core/models/user.model';
import {Room} from '../../../../features/core/models/room.model';
import {RoomService} from '../../../../features/core/services/room.service';
import {UserService} from '../../../../features/core/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  users: User[] = [];
  rooms: Room[] = [];

  constructor(
    private readonly roomService: RoomService,
    private readonly userService: UserService,
  ) {
  }

  ngOnInit(): void {
    this.roomService.getAllRooms().subscribe(value => {
      this.rooms = value;
    });

    this.userService.getAllUsers().subscribe(value => {
      this.users = value;
    });
  }

}
