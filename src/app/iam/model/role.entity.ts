import { BaseEntity } from '../../shared/model/base.entity';

export interface RoleEntity extends BaseEntity {
  name: string;
  description?: string;
}
