import { TestBed } from '@angular/core/testing';

import { DataAugmentService } from './data-augment.service';

describe('DataAugmentService', () => {
  let service: DataAugmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataAugmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
