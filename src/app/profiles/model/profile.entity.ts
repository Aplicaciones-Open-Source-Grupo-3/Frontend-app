import { BaseEntity } from '../../shared/model/base.entity';
import { UserType } from '../../shared/model/enum/user-type.enum';

export interface ProfileEntity extends BaseEntity {
  fullName: string;
  email: string;
  phone?: string;
  userType: UserType;
  companyName?: string;
}
