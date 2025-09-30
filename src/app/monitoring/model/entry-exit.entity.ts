import { BaseEntity } from '../../shared/model/base.entity';

export interface EntryExitEntity extends BaseEntity {
  plate: string;
  entryTime: string;
  exitTime?: string;
}
