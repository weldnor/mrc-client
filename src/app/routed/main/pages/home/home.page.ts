import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../../features/core/services/user.service';
import {User} from '../../../../features/core/models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {

  users: User[] = [];

  constructor(private readonly userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(value => {
      this.users = value;
    });
  }

}
