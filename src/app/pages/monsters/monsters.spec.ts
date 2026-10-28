import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Monsters } from './monstruos';

describe('Monsters', () => {
  let component: Monsters;
  let fixture: ComponentFixture<Monsters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Monsters]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Monsters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
