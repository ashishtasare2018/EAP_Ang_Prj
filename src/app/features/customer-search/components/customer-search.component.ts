import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Message } from 'primeng/message';
import { Observable, Subject, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { Customer, SearchState, SearchValidationResult } from '../models';
import { CustomerSearchService } from '../services/customer-search.service';
import { CustomerCardComponent } from './customer-card.component';

const MIN_QUERY_LENGTH = 2;

/**
 * Search box and results panel for looking up a customer by id, name, or
 * email. A search only runs when the user submits the form (button click or
 * Enter) — typing alone never calls the API. Detection and validation of the
 * query type is delegated entirely to {@link CustomerSearchService}.
 */
@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    InputText,
    ButtonDirective,
    Skeleton,
    Message,
    CustomerCardComponent,
  ],
  templateUrl: './customer-search.component.html',
  styleUrl: './customer-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerSearchComponent implements OnInit {
  private readonly customerSearchService: CustomerSearchService = inject(CustomerSearchService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly searchTrigger: Subject<string> = new Subject<string>();

  readonly searchControl: FormControl<string> = new FormControl('', { nonNullable: true });
  readonly searchState: WritableSignal<SearchState> = signal<SearchState>('idle');
  readonly customer: WritableSignal<Customer | null> = signal<Customer | null>(null);
  readonly validationError: WritableSignal<string | null> = signal<string | null>(null);

  /** @inheritdoc */
  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        filter((value: string) => value.trim().length < MIN_QUERY_LENGTH),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.searchState.set('idle');
        this.customer.set(null);
        this.validationError.set(null);
      });

    this.searchTrigger
      .pipe(
        distinctUntilChanged(),
        switchMap((value: string): Observable<Customer[] | null> =>
          this.customerSearchService.search(value).pipe(
            catchError(() => {
              this.searchState.set('error');
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((customers: Customer[] | null) => {
        if (customers === null) {
          return;
        }

        if (customers.length === 0) {
          this.searchState.set('not-found');
          this.customer.set(null);
          return;
        }

        this.searchState.set('found');
        this.customer.set(customers[0]);
      });
  }

  /** Validates the current input and triggers a search; bound to the form submit (button click or Enter). */
  onSearch(): void {
    const value: string = this.searchControl.value.trim();

    if (value.length === 0) {
      this.searchState.set('idle');
      this.customer.set(null);
      this.validationError.set(null);
      return;
    }

    const validation: SearchValidationResult = this.customerSearchService.validateQuery(value);

    // A single digit is already a complete, valid id (JSONPlaceholder ids are 1-10), so the
    // minimum-length guard only applies to non-id queries — otherwise no id could ever be searched.
    if (validation.searchType !== 'id' && value.length < MIN_QUERY_LENGTH) {
      this.searchState.set('idle');
      this.customer.set(null);
      this.validationError.set(null);
      return;
    }

    if (!validation.valid) {
      this.searchState.set('invalid');
      this.customer.set(null);
      this.validationError.set(validation.errorMessage);
      return;
    }

    this.validationError.set(null);
    this.searchState.set('loading');
    this.customer.set(null);
    this.searchTrigger.next(value);
  }
}
