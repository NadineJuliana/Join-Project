import { Component, inject, signal } from '@angular/core';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { ActivatedRoute } from '@angular/router';
import { TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-tasks-page',
  imports: [TaskFormComponent, ToastComponent],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent {
  private route = inject(ActivatedRoute);
  status = signal<TaskStatus>('to-do');

  ngOnInit() {
    const statusParam = this.route.snapshot.queryParamMap.get(
      'status',
    ) as TaskStatus;
    if (statusParam) {
      this.status.set(statusParam);
    }
  }
}
