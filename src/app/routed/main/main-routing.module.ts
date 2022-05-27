import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomePage} from './pages/home/home.page';
import {LoginPage} from './pages/login/login.page';
import {RegisterPage} from './pages/register/register.page';
import {UserPage} from './pages/user/user.page';
import {RoomPage} from './pages/room/room.page';
import {SettingsPage} from './pages/settings/settings.page';
import {JoinPage} from "./pages/join/join.page";
import {AuthGuard} from "../../features/core/services/auth.guard";
import {AdminPage} from "./pages/admin/admin.page";

const routes: Routes = [
  {path: 'home', component: HomePage, canActivate: [AuthGuard]},
  {path: 'admin', component: AdminPage},
  {path: 'login', component: LoginPage},
  {path: 'register', component: RegisterPage},
  {path: 'users/:id', component: UserPage},
  {path: 'rooms/:id', component: RoomPage},
  {path: 'join/:id', component: JoinPage},
  {path: 'settings', component: SettingsPage},
  {path: '**', redirectTo: '/home'},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule {
}
