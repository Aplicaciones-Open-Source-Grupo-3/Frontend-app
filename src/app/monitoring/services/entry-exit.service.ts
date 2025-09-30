import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EntryExitEntity } from '../model/entry-exit.entity';
import { BaseService } from '../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class EntryExitService extends BaseService {
  getRecentMovements(): Observable<EntryExitEntity[]> {
    return this.get<EntryExitEntity[]>('entryExit');
  }
}
