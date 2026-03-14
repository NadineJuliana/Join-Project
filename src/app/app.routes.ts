import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout/main-layout.component';
import { SummaryPageComponent } from './features/summary/page/summary-page/summary-page.component';
import { ContactsPageComponent } from './features/contacts/page/contacts-page/contacts-page.component';
import { TasksPageComponent } from './features/tasks/page/tasks-page/tasks-page.component';
import { BoardPageComponent } from './features/board/page/board-page/board-page.component';
import { PrivacypolicyPageComponent } from './features/privacy/privacypolicy-page/privacypolicy-page.component';
import { LegalnoticePageComponent } from './features/legalnotice/legalnotice-page/legalnotice-page.component';
import { LandingPageComponent } from './features/auth/page/landing-page/landing-page.component';
import { authGuard } from './core/guards/auth.guard';
import { HelpPageComponent } from './features/help/help-page/help-page.component';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

/**
 * @category Routing
 * @description Application routing configuration defining public and protected routes.
 *
 * This configuration contains:
 * - Public routes: login, signup, legal pages, and privacy policy
 * - Protected routes: routes inside MainLayout guarded by `authGuard`
 *
 * Structure:
 * 1. Authentication pages (login/signup)
 * 2. Public layout pages (legal + privacy)
 * 3. Protected application layout (requires authentication)
 */
export const routes: Routes = [
  {
    path: 'login',
    component: LandingPageComponent,
  },
  {
    path: 'signup',
    component: LandingPageComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'privacy-policy', component: PrivacypolicyPageComponent },
      { path: 'legal-notice', component: LegalnoticePageComponent },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'summary',
        component: SummaryPageComponent,
      },
      {
        path: 'add-task',
        component: TasksPageComponent,
      },
      {
        path: 'board',
        component: BoardPageComponent,
      },
      {
        path: 'contacts',
        component: ContactsPageComponent,
      },
      {
        path: 'help',
        component: HelpPageComponent,
      },
    ],
  },
];
