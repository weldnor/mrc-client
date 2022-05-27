import {Component, OnInit} from '@angular/core';
import {Room} from "../../../../features/core/models/room.model";
import {User} from "../../../../features/core/models/user.model";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss']
})
export class AdminPage implements OnInit {

  rooms: Room[] = [
    {id: '1', creator: 'user1', name: 'room1'},
    {id: '2', creator: 'user2', name: 'room2'},
    {id: '3', creator: 'user3', name: 'room3'},
  ];

  users: User[] = [
    {id: '1', email: 'user1@gmail.com', name: 'user1'},
    {id: '2', email: 'user2@gmail.com', name: 'user2'},
  ];

  constructor() {
  }

  ngOnInit(): void {
  }

}
