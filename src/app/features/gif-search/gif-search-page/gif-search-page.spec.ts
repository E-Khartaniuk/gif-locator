import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GifSearchPage } from './gif-search-page';

describe('GifSearchPage', () => {
  let component: GifSearchPage;
  let fixture: ComponentFixture<GifSearchPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GifSearchPage],
    }).compileComponents();

    fixture = TestBed.createComponent(GifSearchPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
