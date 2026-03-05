import { Component, input, output } from '@angular/core';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-dialog',
  imports: [TaskFormComponent],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.scss',
})
export class TaskDialogComponent {
  status = input<TaskStatus>('to-do');
  dialogClosed = output<void>();
  taskCreated = output<Task>();

  closeDialog(): void {
    this.dialogClosed.emit();
  }

  handleTaskCreated(task: Task): void {
    this.taskCreated.emit(task);
    this.closeDialog();
  }
}
