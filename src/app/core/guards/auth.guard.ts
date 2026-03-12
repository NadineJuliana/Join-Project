import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const loggedIn = await auth.isLoggedIn();
  if (!loggedIn) {
    await auth.logout();
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
  return true;
};
