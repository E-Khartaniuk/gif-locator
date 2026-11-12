import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GifDetailsDialog } from './gif-details-dialog';

describe('GifDetailsDialog', () => {
  let component: GifDetailsDialog;
  let fixture: ComponentFixture<GifDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GifDetailsDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(GifDetailsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
