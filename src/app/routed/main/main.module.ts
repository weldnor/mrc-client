import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomePage} from './pages/home/home.page';
import {MainRoutingModule} from './main-routing.module';
import {LoginPage} from './pages/login/login.page';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatOptionModule} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {RegisterPage} from './pages/register/register.page';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {UserPage} from './pages/user/user.page';
import {RoomPage} from './pages/room/room.page';
import {SettingsPage} from './pages/settings/settings.page';
import { JoinPage } from './pages/join/join.page';


@NgModule({
  declarations: [
    HomePage,
    LoginPage,
    RegisterPage,
    UserPage,
    RoomPage,
    SettingsPage,
    JoinPage,
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class MainModule {
}
