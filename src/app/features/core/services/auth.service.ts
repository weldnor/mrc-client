import {Injectable} from '@angular/core';
import {User} from '../models/user.model';
import {UserService} from './user.service';
import {LoginRequest} from '../models/login-request.model';
import {tap} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {NewUser} from '../models/new-user.model';
import {environment} from "../../../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public $authorized: BehaviorSubject<boolean>;
  private userId;

  constructor(
    private readonly userService: UserService,
    private readonly http: HttpClient,
  ) {
    this.$authorized = new BehaviorSubject<boolean>(localStorage.getItem('user_id') != null);
    this.userId = localStorage.getItem('user_id');
  }

  login(loginRequest: LoginRequest): Observable<User | undefined> {
    return this.http.post<User>(`${environment.apiUrl}/api/auth/login`, loginRequest).pipe(
      tap(u => {
        this.userId = u.id;
        this.$authorized.next(true);
        localStorage.setItem('user_id', u.id);
      })
    );
  }

  register(newUser: NewUser): Observable<User | undefined> {
    return this.http.post<User>(`${environment.apiUrl}/api/auth/register`, newUser).pipe(
      tap(u => {
        this.userId = u.id;
        this.$authorized.next(true);
        localStorage.setItem('user_id', u.id);
      })
    );
  }

  logout(): void {
    this.userId = null;
    this.$authorized.next(false);
    localStorage.removeItem('userId');
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  isAuthorized(): boolean {
    return this.$authorized.value;
  }
}
