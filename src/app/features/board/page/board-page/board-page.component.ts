import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TasksService } from '../../../tasks/services/tasks.service';
import { ContactsService } from '../../../contacts/services/contacts.service';
import { Task, TaskStatus } from '../../../tasks/models/task.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { EllipsisPipe } from '../../../../shared/pipes/ellipsis.pipe';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';

// Interface - Definiert die Struktur einer Spalte
export interface BoardColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'app-board-page',
  imports: [
    CommonModule,
    DragDropModule,
    InitialsPipe,
    EllipsisPipe,
    CapitalizePipe,
  ],
  templateUrl: './board-page.component.html',
  styleUrl: './board-page.component.scss',
})
export class BoardPageComponent {
  activeDropListId: string | null = null;
  dbContactService = inject(ContactsService);
  dbTaskService = inject(TasksService);

  async ngOnInit() {
    await this.dbContactService.getAllContacts();
    await this.dbTaskService.initialize();
    this.dbContactService.initRealtime();
    this.dbTaskService.initRealtime();
  }

  get boardColumns(): BoardColumn[] {
    return [
      { id: 'to-do', title: 'To Do', tasks: this.dbTaskService.toDoTasks() },
      {
        id: 'in-progress',
        title: 'In Progress',
        tasks: this.dbTaskService.inProgressTasks(),
      },
      {
        id: 'await-feedback',
        title: 'Await Feedback',
        tasks: this.dbTaskService.awaitFeedbackTasks(),
      },
      { id: 'done', title: 'Done', tasks: this.dbTaskService.doneTasks() },
    ];
  }

  drop(event: CdkDragDrop<Task[]>) {
    const task = event.item.data as Task;
    const newStatus = event.container.id as TaskStatus;
    event.previousContainer.data.splice(event.previousIndex, 1);
    event.container.data.splice(event.currentIndex, 0, task);
    task.status = newStatus;
    this.dbTaskService.moveTaskAndReorder(
      task,
      event.container.data,
      newStatus,
    );
  }

  onDropListEntered(columnId: string): void {
    this.activeDropListId = columnId;
  }

  onDropListExited(columnId: string): void {
    this.activeDropListId = null;
  }

  getPriorityIcon(priority: 'low' | 'medium' | 'urgent') {
    switch (priority) {
      case 'low':
        return 'icons/prio-icons/low_icon.svg';
      case 'medium':
        return 'icons/prio-icons/medium_icon.svg';
      case 'urgent':
        return 'icons/prio-icons/urgent_icon.svg';
    }
  }
}
