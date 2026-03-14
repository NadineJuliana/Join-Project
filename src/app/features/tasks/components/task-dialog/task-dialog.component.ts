import { Component, input, output } from '@angular/core';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskFormComponent } from '../task-form/task-form.component';

/**
 * @category Dialogs
 * @description Add Tasks Dialog component for creating tasks using the TaskFormComponent.
 * Handles backdrop clicks, task creation events, and dialog closing.
 */
@Component({
  selector: 'app-task-dialog',
  imports: [TaskFormComponent],
  templateUrl: './task-dialog.component.html',
  styleUrl: './task-dialog.component.scss',
})
export class TaskDialogComponent {
  /** Input status defining the default task status */
  status = input<TaskStatus>('to-do');

  /** Event emitted when the dialog is closed */
  dialogClosed = output<void>();

  /** Event emitted when a task has been successfully created */
  taskCreated = output<Task>();

  /** Close dialog when clicking outside the dialog content */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDialog();
    }
  }

  /** Emit dialog closed event */
  closeDialog(): void {
    this.dialogClosed.emit();
  }

  /** Emit task created event and close dialog */
  handleTaskCreated(task: Task): void {
    this.taskCreated.emit(task);
    this.closeDialog();
  }
}
