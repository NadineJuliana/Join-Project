import { TestBed } from '@angular/core/testing';

import { SupabaseRealtimeServiceService } from './supabase-realtime.service.service';

describe('SupabaseRealtimeServiceService', () => {
  let service: SupabaseRealtimeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseRealtimeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
