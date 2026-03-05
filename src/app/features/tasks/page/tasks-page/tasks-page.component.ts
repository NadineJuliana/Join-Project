import { Component } from '@angular/core';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-tasks-page',
  imports: [TaskFormComponent, ToastComponent],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent {}
