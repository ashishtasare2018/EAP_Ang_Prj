import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomerSearchComponent } from './features/customer-search/components/customer-search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CustomerSearchComponent],
  template: `<main><app-customer-search /></main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
