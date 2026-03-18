import { Component, input, output, signal } from '@angular/core';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { Task } from '../../../tasks/models/task.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { EllipsisPipe } from '../../../../shared/pipes/ellipsis.pipe';
import { TasksService } from '../../../tasks/services/tasks.service';
import { Subtask } from '../../../tasks/models/subtask.model';
import { TaskFormComponent } from '../../../tasks/components/task-form/task-form.component';

/**
 * @category Dialogs
 * @description Detail dialog component to display and edit a single Task.
 */
  @Component({
    selector: 'app-detail-dialog',
    imports: [
      CapitalizePipe,
      InitialsPipe,
      CapitalizePipe,
      EllipsisPipe,
      TaskFormComponent,
    ],
    templateUrl: './detail-dialog.component.html',
    styleUrl: './detail-dialog.component.scss',
  })
  export class DetailDialogComponent {
    /** Task input from parent component */
      task = input.required<Task>();

    /** Emits when the dialog is closed */
      closeDialog = output<void>();

    /** Toggles edit mode */
      isEditMode = signal(false);

    /** Inject TasksService */
      constructor(private tasksService: TasksService) {}

    /** Close dialog and emit event */
      onClose() {
        this.closeDialog.emit();
      }

    /** Enter edit mode */
      onEdit(): void {
        this.isEditMode.set(true);
      }

    /** Cancel edit mode */
      onCancelEdit(): void {
        this.isEditMode.set(false);
      }

    /** Delete the current task */
      async deleteTask() {
        try {
          await this.tasksService.deleteTask(this.task().id);
          this.onClose();
        } catch (error) {
          console.error('Fehler beim Löschen der Task:', error);
        }
      }

    /** Called when a task is updated */
      onTaskUpdated(updatedTask: Task) {
        this.isEditMode.set(false);
      }

    /** Returns icon filename for task priority */
      getPriorityIcon(priority: 'low' | 'medium' | 'urgent') {
        switch (priority) {
          case 'low':
            return 'low_icon.svg';
          case 'medium':
            return 'medium_icon.svg';
          case 'urgent':
            return 'urgent_icon.svg';
        }
      }

    /** Toggle a subtask's completion */
      toggleSubtask(subtask: Subtask, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        subtask.completed = checked;
        this.tasksService.updateSubtask(subtask);
      }
  }
