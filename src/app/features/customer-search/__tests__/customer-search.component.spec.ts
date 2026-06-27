import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { vi, type Mock } from 'vitest';
import { Subject, of, throwError } from 'rxjs';
import { CustomerSearchComponent } from '../components/customer-search.component';
import { CustomerSearchService } from '../services/customer-search.service';
import { Customer, SearchValidationResult } from '../models';

const mockCustomer: Customer = {
  id: 1,
  name: 'Leanne Graham',
  username: 'Bret',
  email: 'Sincere@april.biz',
  address: {
    street: 'Kulas Light',
    suite: 'Apt. 556',
    city: 'Gwenborough',
    zipcode: '92998-3874',
    geo: { lat: '-37.3159', lng: '81.1496' },
  },
  phone: '1-770-736-8031 x56442',
  website: 'hildegard.org',
  company: {
    name: 'Romaguera-Crona',
    catchPhrase: 'Multi-layered client-server neural-net',
    bs: 'harness real-time e-markets',
  },
};

const VALID_USERNAME_RESULT: SearchValidationResult = {
  valid: true,
  searchType: 'username',
  errorMessage: null,
};

describe('CustomerSearchComponent', () => {
  let fixture: ComponentFixture<CustomerSearchComponent>;
  let component: CustomerSearchComponent;
  let searchServiceMock: { search: Mock; validateQuery: Mock };

  beforeEach(() => {
    searchServiceMock = {
      search: vi.fn().mockReturnValue(of([mockCustomer])),
      validateQuery: vi.fn().mockReturnValue(VALID_USERNAME_RESULT),
    };

    TestBed.configureTestingModule({
      imports: [CustomerSearchComponent, ReactiveFormsModule],
      providers: [{ provide: CustomerSearchService, useValue: searchServiceMock }],
    });

    fixture = TestBed.createComponent(CustomerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render a search input with aria-label="Search customers"', () => {
    const input: HTMLInputElement | null = fixture.nativeElement.querySelector(
      'input[aria-label="Search customers"]',
    );
    expect(input).not.toBeNull();
  });

  it('should render a Search submit button', () => {
    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    );
    expect(button).not.toBeNull();
  });

  it('should not call the service while the user is typing', () => {
    component.searchControl.setValue('Sa');
    component.searchControl.setValue('Sam');
    component.searchControl.setValue('Samantha');
    fixture.detectChanges();

    expect(searchServiceMock.search).not.toHaveBeenCalled();
  });

  it('should not call the service when Search is triggered with an empty input', () => {
    component.searchControl.setValue('   ');
    component.onSearch();
    fixture.detectChanges();

    expect(searchServiceMock.validateQuery).not.toHaveBeenCalled();
    expect(searchServiceMock.search).not.toHaveBeenCalled();
    expect(component.searchState()).toBe('idle');
  });

  it('should not call the service when Search is triggered with fewer than 2 characters', () => {
    component.searchControl.setValue('a');
    component.onSearch();
    fixture.detectChanges();

    expect(searchServiceMock.search).not.toHaveBeenCalled();
    expect(component.searchState()).toBe('idle');
  });

  it('should call the service for a single-digit id even though it is shorter than the minimum length', () => {
    searchServiceMock.validateQuery.mockReturnValue({
      valid: true,
      searchType: 'id',
      errorMessage: null,
    });

    component.searchControl.setValue('1');
    component.onSearch();
    fixture.detectChanges();

    expect(searchServiceMock.search).toHaveBeenCalledWith('1');
    expect(component.searchState()).toBe('found');
  });

  it('should validate and call the service when Search is triggered with a valid query', () => {
    component.searchControl.setValue('Samantha');
    component.onSearch();
    fixture.detectChanges();

    expect(searchServiceMock.validateQuery).toHaveBeenCalledWith('Samantha');
    expect(searchServiceMock.search).toHaveBeenCalledWith('Samantha');
    expect(component.searchState()).toBe('found');
    expect(component.customer()).toEqual(mockCustomer);
  });

  it('should call the service when the form is submitted (Search button click or Enter)', () => {
    component.searchControl.setValue('Samantha');
    fixture.detectChanges();

    const form: HTMLFormElement | null = fixture.nativeElement.querySelector('form');
    expect(form).not.toBeNull();
    form?.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();

    expect(searchServiceMock.search).toHaveBeenCalledWith('Samantha');
  });

  it('should set state to "invalid" and not call search when validation fails', () => {
    searchServiceMock.validateQuery.mockReturnValue({
      valid: false,
      searchType: null,
      errorMessage: 'Enter a valid email address, e.g. name@example.com.',
    });

    component.searchControl.setValue('bad@');
    component.onSearch();
    fixture.detectChanges();

    expect(searchServiceMock.search).not.toHaveBeenCalled();
    expect(component.searchState()).toBe('invalid');
    expect(component.validationError()).toBe('Enter a valid email address, e.g. name@example.com.');

    const alertEl: HTMLElement | null = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alertEl?.textContent).toContain('Enter a valid email address');
  });

  it('should not call the service again for the same query submitted twice in a row', () => {
    component.searchControl.setValue('Samantha');
    component.onSearch();
    component.onSearch();
    fixture.detectChanges();

    expect(searchServiceMock.search).toHaveBeenCalledTimes(1);
  });

  it('should display a loading indicator while state is "loading"', () => {
    component.searchState.set('loading');
    fixture.detectChanges();

    const loadingEl: HTMLElement | null = fixture.nativeElement.querySelector(
      '[data-testid="search-loading"]',
    );
    expect(loadingEl).not.toBeNull();
  });

  it('should display customer info card when state is "found" and customer is not null', () => {
    component.searchState.set('found');
    component.customer.set(mockCustomer);
    fixture.detectChanges();

    const cardEl: HTMLElement | null = fixture.nativeElement.querySelector(
      '[data-testid="search-result-card"]',
    );
    expect(cardEl).not.toBeNull();
  });

  it('should display "Customer not found" message when state is "not-found"', () => {
    component.searchState.set('not-found');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Customer not found');
  });

  it('should display an error message when state is "error"', () => {
    component.searchState.set('error');
    fixture.detectChanges();

    const alertEl: HTMLElement | null = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alertEl).not.toBeNull();
    expect(alertEl?.textContent).toContain('Something went wrong');
  });

  it('should clear previous results when a new search begins', () => {
    component.searchControl.setValue('Samantha');
    component.onSearch();
    fixture.detectChanges();

    expect(component.customer()).toEqual(mockCustomer);
    expect(component.searchState()).toBe('found');

    const pending = new Subject<Customer[]>();
    searchServiceMock.search.mockReturnValueOnce(pending.asObservable());

    component.searchControl.setValue('Kedar');
    component.onSearch();
    fixture.detectChanges();

    expect(component.customer()).toBeNull();
    expect(component.searchState()).toBe('loading');

    pending.complete();
  });

  it('should reset to idle and clear results when the input is cleared', () => {
    component.searchControl.setValue('Samantha');
    component.onSearch();
    fixture.detectChanges();

    expect(component.searchState()).toBe('found');

    component.searchControl.setValue('');
    fixture.detectChanges();

    expect(component.searchState()).toBe('idle');
    expect(component.customer()).toBeNull();
  });

  it('input should have role="searchbox" and aria-live region for results', () => {
    const input: HTMLInputElement | null =
      fixture.nativeElement.querySelector('input[role="searchbox"]');
    expect(input).not.toBeNull();

    const liveRegion: HTMLElement | null =
      fixture.nativeElement.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
  });

  it('should set state to "not-found" when the service resolves with an empty array', () => {
    searchServiceMock.search.mockReturnValueOnce(of([]));

    component.searchControl.setValue('Kedar');
    component.onSearch();
    fixture.detectChanges();

    expect(component.searchState()).toBe('not-found');
    expect(component.customer()).toBeNull();
  });

  it('should set state to "error" when the service errors', () => {
    searchServiceMock.search.mockReturnValueOnce(throwError(() => new Error('network down')));

    component.searchControl.setValue('Offline');
    component.onSearch();
    fixture.detectChanges();

    expect(component.searchState()).toBe('error');
    expect(component.customer()).toBeNull();
  });
});
