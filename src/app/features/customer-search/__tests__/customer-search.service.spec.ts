import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomerSearchService } from '../services/customer-search.service';
import { Customer } from '../models';

const BASE_URL = 'https://jsonplaceholder.typicode.com/users/';

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
    geo: {
      lat: '-37.3159',
      lng: '81.1496',
    },
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting(), CustomerSearchService],
    });

    service = TestBed.inject(CustomerSearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the API with ?id= when query is a numeric string', () => {
    service.search('1').subscribe();

    const req = httpMock.expectOne((r) => r.url === BASE_URL && r.params.get('id') === '1');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('email')).toBe(false);
    expect(req.request.params.has('username')).toBe(false);
    req.flush([mockCustomer]);
  });

  it('should call the API with ?email= when query contains "@"', () => {
    service.search('Sincere@april.biz').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === BASE_URL && r.params.get('email') === 'Sincere@april.biz',
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('id')).toBe(false);
    expect(req.request.params.has('username')).toBe(false);
    req.flush([mockCustomer]);
  });

  it('should call the API with ?username= when query is a plain string', () => {
    service.search('Samantha').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === BASE_URL && r.params.get('username') === 'Samantha',
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('id')).toBe(false);
    expect(req.request.params.has('email')).toBe(false);
    req.flush([mockCustomer]);
  });

  it('should return an Observable of Customer[]', () => {
    let result: Customer[] | undefined;
    service.search('1').subscribe((customers: Customer[]) => {
      result = customers;
    });

    const req = httpMock.expectOne((r) => r.url === BASE_URL);
    req.flush([mockCustomer]);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([mockCustomer]);
  });

  it('should return empty array when API returns []', () => {
    let result: Customer[] | undefined;
    service.search('999').subscribe((customers: Customer[]) => {
      result = customers;
    });

    const req = httpMock.expectOne((r) => r.url === BASE_URL);
    req.flush([]);

    expect(result).toEqual([]);
  });

  it('should fall back to a username search when the query fails validation', () => {
    service.search('bad@').subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === BASE_URL && r.params.get('username') === 'bad@',
    );
    expect(req.request.params.has('id')).toBe(false);
    expect(req.request.params.has('email')).toBe(false);
    req.flush([]);
  });

  it('should propagate HTTP errors as Observables', () => {
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

    const req = httpMock.expectOne((r) => r.url === BASE_URL);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

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
});
