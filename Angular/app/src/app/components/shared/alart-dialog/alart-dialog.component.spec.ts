import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlartDialogComponent } from './alart-dialog.component';

describe('AlartDialogComponent', () => {
  let component: AlartDialogComponent;
  let fixture: ComponentFixture<AlartDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlartDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlartDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
