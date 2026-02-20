import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout/main-layout.component';
import { SummaryPageComponent } from './features/summary/page/summary-page/summary-page.component';
import { ContactsPageComponent } from './features/contacts/page/contacts-page/contacts-page.component';
import { TasksPageComponent } from './features/tasks/page/tasks-page/tasks-page.component';
import { BoardPageComponent } from './features/board/page/board-page/board-page.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
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
    ],
  },
];
