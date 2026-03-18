import { Component, inject, signal } from '@angular/core';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { ActivatedRoute } from '@angular/router';
import { TaskStatus } from '../../models/task.model';

/**
 * @category Pages
 * @description Add Tasks Page component for creating new tasks.
 * Reads the task status from query parameters and passes it to the task form.
 */
  @Component({
    selector: 'app-tasks-page',
    imports: [TaskFormComponent, ToastComponent],
    templateUrl: './tasks-page.component.html',
    styleUrl: './tasks-page.component.scss',
  })
  export class TasksPageComponent {
    /** ActivatedRoute used to read query parameters */
      private route = inject(ActivatedRoute);

    /** Signal holding the default task status for the form */
      status = signal<TaskStatus>('to-do');

    /** Initialize component and read status from query params */
      ngOnInit() {
        const statusParam = this.route.snapshot.queryParamMap.get(
          'status',
        ) as TaskStatus;
        if (statusParam) {
          this.status.set(statusParam);
        }
      }
  }
