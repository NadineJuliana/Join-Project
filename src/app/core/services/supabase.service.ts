import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private static supabaseClient: SupabaseClient;
  constructor() {
    if (!SupabaseService.supabaseClient) {
      SupabaseService.supabaseClient = createClient(
        environment.supabaseUrl,
        environment.supabaseKey,
      );
      console.log('Supabase client initialized');
    }
  }

  getSupabaseClient(): SupabaseClient {
    console.log('Supabase client accessed');
    return SupabaseService.supabaseClient;
  }
}
