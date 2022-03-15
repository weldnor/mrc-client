import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../../features/core/services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly route: Router,
  ) {
    // init form
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
  }

  onLoginButtonClick(): void {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    this.authService.login({email, password}).subscribe(
      (user) => {
        this.route.navigate([`/users/${user.userId}`]);
      },
      () => {
        this.errorMessage = 'oops!'; // FIXME
      }
    );
  }

}
