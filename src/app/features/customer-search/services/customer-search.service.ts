import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiHttpClientService } from './api-http-client.service';
import { Customer, SearchType, SearchValidationResult } from '../models';

const ID_PATTERN: RegExp = /^\d+$/;
const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN: RegExp = /^[A-Za-z0-9' .-]+$/;
const INVALID_EMAIL_MESSAGE: string = 'Enter a valid email address, e.g. name@example.com.';
const INVALID_QUERY_MESSAGE: string = 'Enter a valid ID, name, or email address.';

/**
 * Looks up customers from the JSONPlaceholder users API. The only public
 * entry points are {@link CustomerSearchService.search} and
 * {@link CustomerSearchService.validateQuery}; query-type detection is
 * intentionally private so callers never need to duplicate it.
 */
@Injectable({ providedIn: 'root' })
export class CustomerSearchService {
  private readonly apiHttp: ApiHttpClientService = inject(ApiHttpClientService);
  private readonly BASE_URL: string = 'https://jsonplaceholder.typicode.com/users/';

  /**
   * Searches for customers matching the given query. Callers are expected to
   * have already checked {@link CustomerSearchService.validateQuery}; if an
   * invalid query is passed in anyway, it falls back to a username search
   * rather than throwing. HTTP errors are not caught here and propagate to
   * the caller.
   */
  search(query: string): Observable<Customer[]> {
    const validation: SearchValidationResult = this.validateQuery(query);
    const searchType: SearchType = validation.searchType ?? 'username';
    const params: HttpParams = new HttpParams().set(searchType, query);

    return this.apiHttp.get<Customer[]>(this.BASE_URL, params);
  }

  /**
   * Validates a raw query and determines which search type it belongs to.
   * A query containing "@" is always evaluated as an email — never silently
   * reinterpreted as a name — so a malformed address is rejected instead of
   * being sent to the API as a username search.
   */
  validateQuery(query: string): SearchValidationResult {
    const trimmed: string = query.trim();

    if (ID_PATTERN.test(trimmed)) {
      return { valid: true, searchType: 'id', errorMessage: null };
    }

    if (trimmed.includes('@')) {
      return EMAIL_PATTERN.test(trimmed)
        ? { valid: true, searchType: 'email', errorMessage: null }
        : { valid: false, searchType: null, errorMessage: INVALID_EMAIL_MESSAGE };
    }

    return NAME_PATTERN.test(trimmed)
      ? { valid: true, searchType: 'username', errorMessage: null }
      : { valid: false, searchType: null, errorMessage: INVALID_QUERY_MESSAGE };
  }
}
