import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateSubscriberRequest } from '../../services/subscriber.service';

@Component({
  selector: 'app-subscriber-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './subscriber-form.component.html',
  styleUrls: ['./subscriber-form.component.css']
})
export class SubscriberFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly onCancel = output<void>();
  readonly onSubmit = output<CreateSubscriberRequest>();

  readonly subscriberForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{9,15}$/)]],
    email: ['', [Validators.required, Validators.email]],
    vehiclePlate: ['', [Validators.required]],
    subscriptionMonths: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
    amount: [0, [Validators.required, Validators.min(0)]],
    startDate: [this.getCurrentDate(), [Validators.required]],
    paymentDate: [this.getCurrentDate(), [Validators.required]]
  });

  private getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  cancel(): void {
    this.onCancel.emit();
  }

  submit(): void {
    if (this.subscriberForm.invalid) {
      this.subscriberForm.markAllAsTouched();
      return;
    }

    const formValue = this.subscriberForm.getRawValue();
    const subscriber: CreateSubscriberRequest = {
      name: formValue.name,
      phone: formValue.phone,
      email: formValue.email,
      vehiclePlate: formValue.vehiclePlate,
      subscriptionMonths: formValue.subscriptionMonths,
      amount: formValue.amount,
      startDate: formValue.startDate,
      paymentDate: formValue.paymentDate
    };

    console.log('📝 Enviando suscriptor al servicio:', subscriber);
    this.onSubmit.emit(subscriber);
  }
}
