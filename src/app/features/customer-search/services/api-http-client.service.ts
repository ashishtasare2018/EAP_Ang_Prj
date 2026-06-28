import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { catchError, Observable, take, throwError, timeout } from 'rxjs';

const DEFAULT_HEADERS = new HttpHeaders({
  'Content-Type': 'application/json',
  Accept: 'application/json',
});
const REQUEST_TIMEOUT_MS = 10_000;

@Injectable({ providedIn: 'root' })
export class ApiHttpClientService {
  private readonly http = inject(HttpClient);

  /**
   * Performs a typed HTTP GET request.
   *
   * @param url    Absolute URL or path to call.
   * @param params Optional HttpParams to append as query string.
   * @returns      Observable that emits the typed response body once then completes.
   */
  get<T>(url: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(url, { headers: DEFAULT_HEADERS, params })
      .pipe(take(1), timeout(REQUEST_TIMEOUT_MS), catchError(this.handleError));
  }

  /**
   * Performs a typed HTTP POST request.
   *
   * @param url  Absolute URL or path to call.
   * @param body Request payload — must be JSON-serialisable.
   * @returns    Observable that emits the typed response body once then completes.
   */
  post<T, B>(url: string, body: B): Observable<T> {
    return this.http
      .post<T>(url, body, { headers: DEFAULT_HEADERS })
      .pipe(take(1), timeout(REQUEST_TIMEOUT_MS), catchError(this.handleError));
  }

  private readonly handleError = (err: unknown): Observable<never> => {
    if (err instanceof HttpErrorResponse) {
      return throwError(() => new Error(err.message));
    }
    return throwError(() => new Error('An unexpected network error occurred.'));
  };
}
