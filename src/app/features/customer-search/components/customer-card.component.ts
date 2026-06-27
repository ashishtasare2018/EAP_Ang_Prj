import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { PrimeTemplate } from 'primeng/api';
import { Customer } from '../models';

/** Presentational card that renders the full detail of a single {@link Customer}. */
@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [Card, Divider, PrimeTemplate],
  templateUrl: './customer-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerCardComponent {
  /** The customer whose details should be displayed. */
  readonly customer: InputSignal<Customer> = input.required<Customer>();
}
