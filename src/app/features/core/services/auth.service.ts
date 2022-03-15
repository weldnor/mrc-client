import {Injectable} from '@angular/core';
import {User} from '../models/user.model';
import {UserService} from './user.service';
import {LoginRequest} from '../models/login-request.model';
import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {NewUser} from '../models/new-user.model';
import {CurrentUserService} from './current-user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User | undefined;

  constructor(
    private readonly userService: UserService,
    private readonly currentUserService: CurrentUserService,
  ) {
  }

  static saveUserInStorage(u: User): void {
    localStorage.setItem('userId', String(u.userId));
  }

  login(loginRequest: LoginRequest): Observable<User | undefined> {
    return this.userService.login(loginRequest).pipe(
      tap(u => {
        AuthService.saveUserInStorage(u);
        this.currentUserService.setUser(u);
      })
    );
  }

  register(newUser: NewUser): Observable<User | undefined> {
    return this.userService.register(newUser).pipe(
      tap(u => {
        AuthService.saveUserInStorage(u);
        this.currentUserService.setUser(u);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('userId');
    this.currentUserService.setUser(undefined);
  }


}
