import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomePage} from './pages/home/home.page';
import {LoginPage} from './pages/login/login.page';
import {RegisterPage} from './pages/register/register.page';
import {UserPage} from './pages/user/user.page';
import {RoomPage} from './pages/room/room.page';
import {SettingsPage} from './pages/settings/settings.page';

const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'prefix'},
  {path: 'home', component: HomePage},
  {path: 'login', component: LoginPage},
  {path: 'register', component: RegisterPage},
  {path: 'users/:id', component: UserPage},
  {path: 'rooms/:id', component: RoomPage},
  {path: 'settings', component: SettingsPage},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {
}
