import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { RoleEntity } from '../model/role.entity';

@Injectable({ providedIn: 'root' })
export class RoleService {
  getRoles(): Observable<RoleEntity[]> {
    return of([
      { id: 1, name: 'Administrator' },
      { id: 2, name: 'Operator' },
      { id: 3, name: 'Client' }
    ]);
  }
}
