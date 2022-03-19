import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../core/services/auth.service';
import {User} from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  isAuthorized = false;
  user: User | undefined;

  constructor(
    private readonly authService: AuthService,
  ) {
    // this.currentUserService.user$.subscribe(user => {
    //   this.user = user;
    // });
  }

  ngOnInit(): void {
  }

  onLogoutButtonClick(): void {
    this.authService.logout();
  }
}
