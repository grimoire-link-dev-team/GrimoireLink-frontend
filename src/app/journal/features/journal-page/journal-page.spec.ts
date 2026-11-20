import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JournalPage } from './journal-page';

describe('JournalPage', () => {
  let component: JournalPage;
  let fixture: ComponentFixture<JournalPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(JournalPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
