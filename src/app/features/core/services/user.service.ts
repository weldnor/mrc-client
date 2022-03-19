import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {User} from '../models/user.model';
import {Observable} from 'rxjs';
import {LoginRequest} from '../models/login-request.model';
import {NewUser} from '../models/new-user.model';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private readonly http: HttpClient) {
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/api/users`);
  }

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/api/users/${userId}`);
  }
}
