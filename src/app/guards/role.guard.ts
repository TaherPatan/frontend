import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as string[];
  console.log(`RoleGuard: Expected roles for route ${route.url.join('/')}:`, expectedRoles);

  return authService.getCurrentUserRole().pipe(
    map(userRole => {
      console.log(`RoleGuard: Current user role from service: '${userRole}'. Expected roles: '${expectedRoles.join(', ')}'.`);
      if (userRole && expectedRoles.includes(userRole)) {
        console.log('RoleGuard: Role check passed.');
        return true;
      } else {
        console.log('RoleGuard: Role check failed. Redirecting to /login.');
        // Redirect to the login page or an unauthorized page
        return router.createUrlTree(['/login']);
      }
    })
  );
};
