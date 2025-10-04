export type OperatorRole = 'admin' | 'operator';
export type OperatorStatus = 'active' | 'inactive';

export interface Operator {
  id: number;
  name: string;
  email: string;
  role: OperatorRole;
  status: OperatorStatus;
  lastActiveKey: string;
}
