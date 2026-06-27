import { ComponentFixture, TestBed } from '@angular/core/testing';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import axe from 'axe-core';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { CustomerSearchComponent } from '../components/customer-search.component';
import { CustomerSearchService } from '../services/customer-search.service';
import { Customer, SearchState } from '../models';

const AXE_CONFIG = {
  runOnly: {
    type: 'tag' as const,
    values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'],
  },
};

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

interface ViolationSummary {
  readonly id: string;
  readonly impact: string | null | undefined;
  readonly description: string;
}

interface StateReportEntry {
  readonly violationCount: number;
  readonly criticalOrSeriousCount: number;
  readonly violations: ReadonlyArray<ViolationSummary>;
}

const report: Partial<Record<SearchState, StateReportEntry>> = {};

const statesToTest: ReadonlyArray<SearchState> = [
  'idle',
  'loading',
  'found',
  'not-found',
  'invalid',
  'error',
];

describe('CustomerSearchComponent accessibility', () => {
  let fixture: ComponentFixture<CustomerSearchComponent>;
  let component: CustomerSearchComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomerSearchComponent],
      providers: [
        { provide: CustomerSearchService, useValue: { search: vi.fn().mockReturnValue(of([])) } },
      ],
    });

    fixture = TestBed.createComponent(CustomerSearchComponent);
    component = fixture.componentInstance;
  });

  afterAll(() => {
    writeFileSync(join(process.cwd(), 'a11y-report.json'), JSON.stringify(report, null, 2));
  });

  for (const state of statesToTest) {
    it(`should have no critical or serious axe violations in the "${state}" state`, async () => {
      if (state === 'loading' || state === 'not-found' || state === 'error' || state === 'invalid') {
        component.searchState.set(state);
        if (state === 'invalid') {
          component.validationError.set('Enter a valid ID, name, or email address.');
        }
      } else if (state === 'found') {
        component.searchState.set('found');
        component.customer.set(mockCustomer);
      }

      fixture.detectChanges();

      const element: HTMLElement = fixture.nativeElement;
      const results = await axe.run(element, AXE_CONFIG);

      const criticalOrSerious: ViolationSummary[] = results.violations
        .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
        .map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
        }));

      report[state] = {
        violationCount: results.violations.length,
        criticalOrSeriousCount: criticalOrSerious.length,
        violations: results.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
        })),
      };

      expect(criticalOrSerious).toHaveLength(0);
    });
  }
});
