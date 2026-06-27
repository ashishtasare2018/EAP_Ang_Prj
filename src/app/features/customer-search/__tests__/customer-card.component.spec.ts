import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerCardComponent } from '../components/customer-card.component';
import { Customer } from '../models';

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

describe('CustomerCardComponent', () => {
  let fixture: ComponentFixture<CustomerCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomerCardComponent],
    });

    fixture = TestBed.createComponent(CustomerCardComponent);
    fixture.componentRef.setInput('customer', mockCustomer);
    fixture.detectChanges();
  });

  it('should render customer name', () => {
    const text: string = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Leanne Graham');
  });

  it('should render email as a mailto link', () => {
    const emailLink: HTMLAnchorElement | null = fixture.nativeElement.querySelector(
      `a[href="mailto:${mockCustomer.email}"]`,
    );
    expect(emailLink).not.toBeNull();
  });

  it('should render website as an external link with rel="noopener noreferrer"', () => {
    const websiteLink: HTMLAnchorElement | null = fixture.nativeElement.querySelector(
      `a[href="https://${mockCustomer.website}"]`,
    );
    expect(websiteLink).not.toBeNull();
    expect(websiteLink?.target).toBe('_blank');
    expect(websiteLink?.rel).toBe('noopener noreferrer');
  });
});
