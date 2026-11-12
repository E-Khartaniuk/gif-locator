import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GifCard } from './gif-card';

describe('GifCard', () => {
  let component: GifCard;
  let fixture: ComponentFixture<GifCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GifCard],
    }).compileComponents();

    fixture = TestBed.createComponent(GifCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
