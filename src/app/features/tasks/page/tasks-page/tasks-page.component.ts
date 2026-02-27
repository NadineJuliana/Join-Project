import { Component } from '@angular/core';
import { TaskFormComponent } from '../../components/task-form/task-form.component';

@Component({
  selector: 'app-tasks-page',
  imports: [TaskFormComponent],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent {}
