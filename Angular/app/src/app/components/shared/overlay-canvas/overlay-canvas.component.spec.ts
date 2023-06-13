import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayCanvasComponent } from './overlay-canvas.component';

describe('OverlayCanvasComponent', () => {
  let component: OverlayCanvasComponent;
  let fixture: ComponentFixture<OverlayCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverlayCanvasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverlayCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
