import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../../features/core/services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  errorMessage: any;

  constructor(
    private readonly authService: AuthService,
    private readonly route: Router,
  ) {
    // init form
    this.registerForm = new FormGroup({
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
  }

  onRegisterButtonClick(): void {
    const name = this.registerForm.value.username;
    const email = this.registerForm.value.email;
    const password = this.registerForm.value.password;

    console.log({name, email, password});

    this.authService.register({name, email, password}).subscribe(
      (user) => {
        this.route.navigate([`/users/${user.userId}`]);
      },
      () => {
        this.errorMessage = 'oops!'; // FIXME
      }
    );
  }
}
