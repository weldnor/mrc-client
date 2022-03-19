import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../../features/core/services/user.service';
import {User} from '../../../../features/core/models/user.model';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss']
})
export class UserPage implements OnInit {

  user: User;
  currentUser: User;

  constructor(
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
  ) {
    // currentUserService.user$.subscribe(value => {
    //   this.currentUser = value;
    // });
    //
    // const userId = route.snapshot.params.id;
    // this.userService.getUser(userId).subscribe(value => {
    //   this.user = value;
    // });
  }

  ngOnInit(): void {
  }

}
