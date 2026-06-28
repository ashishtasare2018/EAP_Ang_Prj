import { TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { ApiHttpClientService } from '../services/api-http-client.service';
import { Customer } from '../models';

const TEST_URL = 'https://jsonplaceholder.typicode.com/users/';

const MOCK_CUSTOMER: Customer = {
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

describe('ApiHttpClientService', () => {
  let service: ApiHttpClientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), ApiHttpClientService],
    });
    service = TestBed.inject(ApiHttpClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // GROUP 1 — Service creation
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // GROUP 2 — get<T>()
  it('should make a GET request to the exact URL provided', () => {
    service.get<Customer[]>(TEST_URL).subscribe();
    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.method).toBe('GET');
    req.flush([MOCK_CUSTOMER]);
  });

  it('should attach HttpParams to the GET request when params argument is provided', () => {
    const params = new HttpParams().set('id', '1');
    service.get<Customer[]>(TEST_URL, params).subscribe();
    const req = httpMock.expectOne((r) => r.url === TEST_URL && r.params.get('id') === '1');
    expect(req.request.method).toBe('GET');
    req.flush([MOCK_CUSTOMER]);
  });

  it('should make a GET request with no query params when params argument is omitted', () => {
    service.get<Customer[]>(TEST_URL).subscribe();
    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.params.keys().length).toBe(0);
    req.flush([MOCK_CUSTOMER]);
  });

  it('should set the Content-Type header to application/json on GET requests', () => {
    service.get<Customer[]>(TEST_URL).subscribe();
    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush([MOCK_CUSTOMER]);
  });

  it('should set the Accept header to application/json on GET requests', () => {
    service.get<Customer[]>(TEST_URL).subscribe();
    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('Accept')).toBe('application/json');
    req.flush([MOCK_CUSTOMER]);
  });

  it('should return an Observable that emits the typed response body', () => {
    let result: Customer[] | undefined;
    service.get<Customer[]>(TEST_URL).subscribe((data) => {
      result = data;
    });
    const req = httpMock.expectOne(TEST_URL);
    req.flush([MOCK_CUSTOMER]);
    expect(result).toEqual([MOCK_CUSTOMER]);
  });

  it('should complete the Observable after a single emission (no long-lived streams)', () => {
    let completed = false;
    service.get<Customer[]>(TEST_URL).subscribe({
      complete: () => {
        completed = true;
      },
    });
    const req = httpMock.expectOne(TEST_URL);
    req.flush([MOCK_CUSTOMER]);
    expect(completed).toBe(true);
  });

  it('should propagate HTTP 4xx errors as an Observable error (use 404)', () => {
    let capturedError: unknown;
    service.get<Customer[]>(TEST_URL).subscribe({
      error: (err: unknown) => {
        capturedError = err;
      },
    });
    const req = httpMock.expectOne(TEST_URL);
    req.flush(null, { status: 404, statusText: 'Not Found' });
    expect(capturedError).toBeInstanceOf(Error);
  });

  it('should propagate HTTP 5xx errors as an Observable error (use 500)', () => {
    let capturedError: unknown;
    service.get<Customer[]>(TEST_URL).subscribe({
      error: (err: unknown) => {
        capturedError = err;
      },
    });
    const req = httpMock.expectOne(TEST_URL);
    req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    expect(capturedError).toBeInstanceOf(Error);
  });

  // GROUP 3 — post<T, B>()
  it('should make a POST request to the exact URL provided', () => {
    service.post<Customer, { name: string }>(TEST_URL, { name: 'Test' }).subscribe();
    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.method).toBe('POST');
    req.flush(MOCK_CUSTOMER);
  });

  it('should send the request body serialised as JSON', () => {
    const body = { name: 'Test User' };
    service.post<Customer, { name: string }>(TEST_URL, body).subscribe();
    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.body).toEqual(body);
    req.flush(MOCK_CUSTOMER);
  });

  it('should set the Content-Type header to application/json on POST requests', () => {
    service.post<Customer, { name: string }>(TEST_URL, { name: 'Test' }).subscribe();
    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush(MOCK_CUSTOMER);
  });

  it('should set the Accept header to application/json on POST requests', () => {
    service.post<Customer, { name: string }>(TEST_URL, { name: 'Test' }).subscribe();
    const req = httpMock.expectOne(TEST_URL);
    expect(req.request.headers.get('Accept')).toBe('application/json');
    req.flush(MOCK_CUSTOMER);
  });

  it('should return an Observable that emits the typed response body on POST', () => {
    let result: Customer | undefined;
    service.post<Customer, { name: string }>(TEST_URL, { name: 'Test' }).subscribe((data) => {
      result = data;
    });
    const req = httpMock.expectOne(TEST_URL);
    req.flush(MOCK_CUSTOMER);
    expect(result).toEqual(MOCK_CUSTOMER);
  });

  it('should complete the Observable after a single emission on POST', () => {
    let completed = false;
    service.post<Customer, { name: string }>(TEST_URL, { name: 'Test' }).subscribe({
      complete: () => {
        completed = true;
      },
    });
    const req = httpMock.expectOne(TEST_URL);
    req.flush(MOCK_CUSTOMER);
    expect(completed).toBe(true);
  });

  it('should propagate HTTP 4xx errors on POST as an Observable error (use 400)', () => {
    let capturedError: unknown;
    service.post<Customer, { name: string }>(TEST_URL, { name: 'Test' }).subscribe({
      error: (err: unknown) => {
        capturedError = err;
      },
    });
    const req = httpMock.expectOne(TEST_URL);
    req.flush(null, { status: 400, statusText: 'Bad Request' });
    expect(capturedError).toBeInstanceOf(Error);
  });

  // GROUP 4 — shared behaviour
  it('should propagate network-level errors (ErrorEvent) as an Observable error', () => {
    let capturedError: unknown;
    service.get<Customer[]>(TEST_URL).subscribe({
      error: (err: unknown) => {
        capturedError = err;
      },
    });
    const req = httpMock.expectOne(TEST_URL);
    req.error(new ErrorEvent('Network error'));
    expect(capturedError).toBeInstanceOf(Error);
  });

  it('should normalise non-HttpErrorResponse errors to "An unexpected network error occurred."', () => {
    vi.useFakeTimers();
    let capturedError: Error | undefined;

    service.get<Customer[]>(TEST_URL).subscribe({
      error: (err: unknown) => {
        if (err instanceof Error) capturedError = err;
      },
    });

    // expectOne removes the request from httpMock's open queue so verify() stays clean.
    // Do not flush — advancing timers will cancel the subscription first.
    httpMock.expectOne(TEST_URL);
    // TimeoutError is not HttpErrorResponse → handleError falls through to generic message
    vi.advanceTimersByTime(11_000);

    vi.useRealTimers();

    expect(capturedError).toBeInstanceOf(Error);
    expect(capturedError?.message).toBe('An unexpected network error occurred.');
  });
});
