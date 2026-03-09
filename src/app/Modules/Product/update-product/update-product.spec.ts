import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpateProduct } from './upate-product';

describe('UpateProduct', () => {
  let component: UpateProduct;
  let fixture: ComponentFixture<UpateProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpateProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpateProduct);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
