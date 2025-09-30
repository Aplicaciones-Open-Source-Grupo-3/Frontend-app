import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { UserEntity } from '../model/user.entity';
import { UserType } from '../../shared/model/enum/user-type.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(email: string, _password: string): Observable<UserEntity> {
    return of({
      id: 1,
      name: 'Alex Johnson',
      email,
      role: UserType.Administrator
    });
  }
}
