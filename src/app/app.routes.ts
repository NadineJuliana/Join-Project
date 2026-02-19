import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout/main-layout.component';
import { ContactsPageComponent } from './features/contacts/page/contacts-page/contacts-page.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'summary',
        redirectTo: '',
      },
      {
        path: 'add-task',
        redirectTo: '',
      },
      {
        path: 'board',
        redirectTo: '',
      },
      {
        path: 'contacts',
        component: ContactsPageComponent,
      },
    ],
  },
];
