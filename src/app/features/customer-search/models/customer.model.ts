/** Geographic coordinates of a {@link Customer}'s address. */
export interface Geo {
  readonly lat: string;
  readonly lng: string;
}

/** Postal address of a {@link Customer}. */
export interface Address {
  readonly street: string;
  readonly suite: string;
  readonly city: string;
  readonly zipcode: string;
  readonly geo: Geo;
}

/** Employer details associated with a {@link Customer}. */
export interface Company {
  readonly name: string;
  readonly catchPhrase: string;
  readonly bs: string;
}

/** A customer record as returned by the JSONPlaceholder users API. */
export interface Customer {
  readonly id: number;
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly address: Address;
  readonly phone: string;
  readonly website: string;
  readonly company: Company;
}

/** Which query parameter a search term should be sent under. */
export type SearchType = 'id' | 'username' | 'email';

/** Lifecycle state of a customer search. */
export type SearchState = 'idle' | 'loading' | 'found' | 'not-found' | 'invalid' | 'error';

/** Outcome of validating a raw query before it is sent to the API. */
export interface SearchValidationResult {
  readonly valid: boolean;
  readonly searchType: SearchType | null;
  readonly errorMessage: string | null;
}
