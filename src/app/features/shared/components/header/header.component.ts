import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../core/services/auth.service';
import {User} from '../../../core/models/user.model';
import {switchMap} from "rxjs/operators";
import {UserService} from "../../../core/services/user.service";
import {of} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  user: User | undefined;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly router: Router,
  ) {
  }

  ngOnInit(): void {
    this.authService.$authorized.pipe(
      switchMap(authorized => {
        console.log(authorized);
        return authorized ? this.userService.getUser(this.authService.getUserId()) : of(undefined);
      })
    ).subscribe(user => {
      this.user = user;
    })
  }

  async onLogoutButtonClick() {
    this.authService.logout();
    await this.router.navigateByUrl('/login');
  }
}
