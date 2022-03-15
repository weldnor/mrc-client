import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage implements OnInit {

  updateProfileForm: FormGroup;
  updatePasswordForm: FormGroup;

  updateProfileErrorMessage: any;
  updatePasswordErrorMessage: any;

  constructor() {
  }

  ngOnInit(): void {
    this.updateProfileForm = new FormGroup({
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    this.updatePasswordForm = new FormGroup({
      password: new FormControl('', Validators.required),
      passwordAgain: new FormControl('', Validators.required),
    });
  }


  onUpdateProfileButtonClick(): void {
  }


  onUpdatePasswordButtonClick(): void {

  }
}
