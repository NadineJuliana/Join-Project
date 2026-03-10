import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabaseClient = inject(SupabaseService).getSupabaseClient();
  const router = inject(Router);
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
