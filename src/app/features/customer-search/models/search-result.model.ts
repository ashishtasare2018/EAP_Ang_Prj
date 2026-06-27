import { SearchState } from './customer.model';

/** Envelope describing the outcome of a search for a value of type `T`. */
export interface SearchResult<T> {
  readonly data: T | null;
  readonly state: SearchState;
  readonly errorMessage: string | null;
}
