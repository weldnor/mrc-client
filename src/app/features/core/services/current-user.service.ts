import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {User} from '../models/user.model';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {

  user$: BehaviorSubject<User | undefined>;

  constructor(private readonly userService: UserService) {
    this.user$ = new BehaviorSubject<User | undefined>(undefined);

    const userId = Number(localStorage.getItem('userId'));
    if (!userId) {
      return;
    }
    // else load user

    this.userService.getUser(userId).subscribe(value => {
      this.setUser(value);
    });
  }

  setUser(user: User): void {
    this.user$.next(user);
  }

  getUser(): User {
    return this.user$.value;
  }
}
