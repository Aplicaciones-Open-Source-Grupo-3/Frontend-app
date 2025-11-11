export interface SubscriberEntity {
  id: string;
  name: string;
  phone: string;
  subscriptionMonths: number;
  paymentDate: string;
  amount: number;
  startDate: string;
  status: 'active' | 'expired' | 'pending';
  vehiclePlate?: string;
  email?: string;
  businessId?: string;
}
