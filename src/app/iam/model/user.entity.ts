import { BaseEntity } from '../../shared/model/base.entity';
import { UserType } from '../../shared/model/enum/user-type.enum';

export interface UserEntity extends BaseEntity {
  name: string;
  email: string;
  role: UserType;
}
