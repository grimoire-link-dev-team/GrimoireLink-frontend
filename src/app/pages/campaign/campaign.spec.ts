import { ComponentFixture, TestBed } from '@angular/core/testing';
import { campaign } from './campaign';

describe('campaign', () => {
  let component: campaign;
  let fixture: ComponentFixture<campaign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [campaign]
    })
      .compileComponents();

    fixture = TestBed.createComponent(campaign);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
