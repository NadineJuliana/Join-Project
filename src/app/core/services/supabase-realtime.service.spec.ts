import { TestBed } from '@angular/core/testing';

import { SupabaseRealtimeService } from './supabase-realtime.service';

describe('SupabaseRealtimeService', () => {
  let service: SupabaseRealtimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseRealtimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
