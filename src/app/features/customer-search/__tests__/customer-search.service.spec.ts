import { TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { CustomerSearchService } from '../services/customer-search.service';
import { ApiHttpClientService } from '../services/api-http-client.service';
import { Customer } from '../models';

const BASE_URL = 'https://jsonplaceholder.typicode.com/users/';

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

describe('CustomerSearchService', () => {
  let service: CustomerSearchService;
  let httpMock: HttpTestingController;
  let mockApiHttp: { get: MockInstance; post: MockInstance };

  beforeEach(() => {
    mockApiHttp = { get: vi.fn(), post: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        { provide: ApiHttpClientService, useValue: mockApiHttp },
        CustomerSearchService,
      ],
    });

    service = TestBed.inject(CustomerSearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the API with ?id= when query is a numeric string', () => {
    mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
    service.search('1').subscribe();
    const params = mockApiHttp.get.mock.calls[0][1] as HttpParams;
    expect(mockApiHttp.get).toHaveBeenCalledWith(BASE_URL, expect.any(HttpParams));
    expect(params.get('id')).toBe('1');
    expect(params.has('email')).toBe(false);
    expect(params.has('username')).toBe(false);
  });

  it('should call the API with ?email= when query contains "@"', () => {
    mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
    service.search('Sincere@april.biz').subscribe();
    const params = mockApiHttp.get.mock.calls[0][1] as HttpParams;
    expect(mockApiHttp.get).toHaveBeenCalledWith(BASE_URL, expect.any(HttpParams));
    expect(params.get('email')).toBe('Sincere@april.biz');
    expect(params.has('id')).toBe(false);
    expect(params.has('username')).toBe(false);
  });

  it('should call the API with ?username= when query is a plain string', () => {
    mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
    service.search('Samantha').subscribe();
    const params = mockApiHttp.get.mock.calls[0][1] as HttpParams;
    expect(mockApiHttp.get).toHaveBeenCalledWith(BASE_URL, expect.any(HttpParams));
    expect(params.get('username')).toBe('Samantha');
    expect(params.has('id')).toBe(false);
    expect(params.has('email')).toBe(false);
  });

  it('should return an Observable of Customer[]', () => {
    mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
    let result: Customer[] | undefined;
    service.search('1').subscribe((customers) => {
      result = customers;
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([MOCK_CUSTOMER]);
  });

  it('should return empty array when API returns []', () => {
    mockApiHttp.get.mockReturnValue(of([]));
    let result: Customer[] | undefined;
    service.search('999').subscribe((customers) => {
      result = customers;
    });
    expect(result).toEqual([]);
  });

  it('should fall back to a username search when the query fails validation', () => {
    mockApiHttp.get.mockReturnValue(of([]));
    service.search('bad@').subscribe();
    const params = mockApiHttp.get.mock.calls[0][1] as HttpParams;
    expect(params.get('username')).toBe('bad@');
    expect(params.has('id')).toBe(false);
    expect(params.has('email')).toBe(false);
  });

  it('should propagate HTTP errors as Observables', () => {
    mockApiHttp.get.mockReturnValue(throwError(() => new Error('Server error')));
    let nextCalled = false;
    let capturedError: unknown;
    service.search('1').subscribe({
      next: () => {
        nextCalled = true;
      },
      error: (err: unknown) => {
        capturedError = err;
      },
    });
    expect(nextCalled).toBe(false);
    expect(capturedError).toBeTruthy();
  });

  describe('validateQuery', () => {
    it('should mark a digit-only query as a valid id', () => {
      expect(service.validateQuery('42')).toEqual({
        valid: true,
        searchType: 'id',
        errorMessage: null,
      });
    });

    it('should trim whitespace before checking for a digit-only id', () => {
      expect(service.validateQuery('  42  ')).toEqual({
        valid: true,
        searchType: 'id',
        errorMessage: null,
      });
    });

    it('should mark a well-formed email as valid', () => {
      expect(service.validateQuery('Sincere@april.biz')).toEqual({
        valid: true,
        searchType: 'email',
        errorMessage: null,
      });
    });

    it('should reject a malformed email instead of falling back to a username search', () => {
      const result = service.validateQuery('not-an-email@');
      expect(result.valid).toBe(false);
      expect(result.searchType).toBeNull();
      expect(result.errorMessage).toContain('valid email address');
    });

    it('should mark a plain alphabetic query as a valid username', () => {
      expect(service.validateQuery('Samantha')).toEqual({
        valid: true,
        searchType: 'username',
        errorMessage: null,
      });
    });

    it('should reject a username containing disallowed characters', () => {
      const result = service.validateQuery('Sam$antha!');
      expect(result.valid).toBe(false);
      expect(result.searchType).toBeNull();
      expect(result.errorMessage).toContain('valid ID, name, or email');
    });
  });

  // Tests 19–24: confirm CustomerSearchService delegates to ApiHttpClientService
  it('should provide ApiHttpClientService through the injector (test 19)', () => {
    const injected = TestBed.inject(ApiHttpClientService);
    expect(injected).toBe(mockApiHttp as unknown as ApiHttpClientService);
  });

  it('should call apiHttpClientService.get with the BASE_URL for an id query (test 20)', () => {
    mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
    service.search('1').subscribe();
    expect(mockApiHttp.get).toHaveBeenCalledWith(BASE_URL, expect.any(HttpParams));
  });

  it('should pass HttpParams with id=1 when query is the string "1" (test 21)', () => {
    mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
    service.search('1').subscribe();
    const params = mockApiHttp.get.mock.calls[0][1] as HttpParams;
    expect(params.get('id')).toBe('1');
    expect(params.has('email')).toBe(false);
    expect(params.has('username')).toBe(false);
  });

  it('should pass HttpParams with email= when query contains "@" and is valid (test 22)', () => {
    mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
    service.search('test@example.com').subscribe();
    const params = mockApiHttp.get.mock.calls[0][1] as HttpParams;
    expect(params.get('email')).toBe('test@example.com');
  });

  it('should pass HttpParams with username= for a plain name query (test 23)', () => {
    mockApiHttp.get.mockReturnValue(of([MOCK_CUSTOMER]));
    service.search('Samantha').subscribe();
    const params = mockApiHttp.get.mock.calls[0][1] as HttpParams;
    expect(params.get('username')).toBe('Samantha');
  });

  it('should forward an error emitted by ApiHttpClientService.get to the caller (test 24)', () => {
    mockApiHttp.get.mockReturnValue(throwError(() => new Error('network failure')));
    let capturedError: Error | undefined;
    service.search('1').subscribe({
      error: (err: Error) => {
        capturedError = err;
      },
    });
    expect(capturedError?.message).toBe('network failure');
  });
});
