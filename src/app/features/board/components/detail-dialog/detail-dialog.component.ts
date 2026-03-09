import { Component, input, output, signal } from '@angular/core';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { Task } from '../../../tasks/models/task.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { EllipsisPipe } from '../../../../shared/pipes/ellipsis.pipe';
import { TasksService } from '../../../tasks/services/tasks.service';
import { Subtask } from '../../../tasks/models/subtask.model';
import { TaskFormComponent } from '../../../tasks/components/task-form/task-form.component';

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
  task = input.required<Task>(); // Eingabe von Parent - die Komponente wird Task von außen erhalten
  closeDialog = output<void>();
  isEditMode = signal(false);

  constructor(private tasksService: TasksService) {}

  onClose() {
    this.closeDialog.emit(); // Sendet das Signal an die Parent
  }

  onEdit(): void {
    this.isEditMode.set(true);
  }

  onCancelEdit(): void {
    this.isEditMode.set(false);
  }

  async deleteTask() {
    try {
      await this.tasksService.deleteTask(this.task().id);
      this.onClose();
    } catch (error) {
      console.error('Fehler beim Löschen der Task:', error);
    }
  }

  onTaskUpdated(updatedTask: Task) {
    this.isEditMode.set(false);
  }

  getPriorityIcon(priority: 'low' | 'medium' | 'urgent') {
    switch (priority) {
      case 'low':
        return 'icons/low_icon.svg';
      case 'medium':
        return 'icons/medium_icon.svg';
      case 'urgent':
        return 'icons/urgent_icon.svg';
    }
  }

  toggleSubtask(subtask: Subtask, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    subtask.completed = checked;
    this.tasksService.updateSubtask(subtask);
  }
}
