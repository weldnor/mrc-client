import {Injectable} from '@angular/core';
import {User} from '../models/user.model';
import {UserService} from './user.service';
import {LoginRequest} from '../models/login-request.model';
import {tap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {NewUser} from '../models/new-user.model';
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser: User | undefined;

  constructor(
    private readonly userService: UserService,
    private readonly http: HttpClient
  ) {
  }

  login(loginRequest: LoginRequest): Observable<User | undefined> {
    return this.http.post<User>(`${environment.apiUrl}/api/auth/login`, loginRequest).pipe(
      tap(u => {
        localStorage.setItem('user_id', u.id);
      })
    );
  }

  register(newUser: NewUser): Observable<User | undefined> {
    return this.http.post<User>(`${environment.apiUrl}/api/auth/register`, newUser).pipe(
      tap(u => {
        localStorage.setItem('user_id', u.id);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('userId');
  }

}
