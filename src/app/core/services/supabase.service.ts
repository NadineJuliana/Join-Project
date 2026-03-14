import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * @category Supabase
 * @description Provides a singleton Supabase client instance for database and auth operations.
 */
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  /** Singleton Supabase client instance */
  private static supabaseClient: SupabaseClient;

  /** Initialize Supabase client singleton */
  constructor() {
    if (!SupabaseService.supabaseClient) {
      SupabaseService.supabaseClient = createClient(
        environment.supabaseUrl,
        environment.supabaseKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        },
      );
    }
  }

  /** Get Supabase client instance */
  getSupabaseClient(): SupabaseClient {
    return SupabaseService.supabaseClient;
  }
}
