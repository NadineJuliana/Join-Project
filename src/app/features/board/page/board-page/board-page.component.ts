import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { TasksService } from '../../../tasks/services/tasks.service';
import { ContactsService } from '../../../contacts/services/contacts.service';
import { Task, TaskStatus } from '../../../tasks/models/task.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { EllipsisPipe } from '../../../../shared/pipes/ellipsis.pipe';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DetailDialogComponent } from '../../components/detail-dialog/detail-dialog.component';

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
    ReactiveFormsModule,
    DetailDialogComponent,
  ],
  templateUrl: './board-page.component.html',
  styleUrl: './board-page.component.scss',
})
export class BoardPageComponent {
  dbContactService = inject(ContactsService);
  dbTaskService = inject(TasksService);
  activeDropListId: string | null = null;
  searchControl = new FormControl('');
  searchResult = toSignal(this.searchControl.valueChanges, {
    initialValue: '',
  });

  toDoTasksFiltered = computed(() => this.filterTasksByStatus('to-do'));
  inProgressTasksFiltered = computed(() =>
    this.filterTasksByStatus('in-progress'),
  );
  awaitFeedbackTasksFiltered = computed(() =>
    this.filterTasksByStatus('await-feedback'),
  );
  doneTasksFiltered = computed(() => this.filterTasksByStatus('done'));

  async ngOnInit() {
    await this.dbContactService.getAllContacts();
    await this.dbTaskService.initialize();
    this.dbContactService.initRealtime();
    this.dbTaskService.initRealtime();
  }

  get boardColumns(): BoardColumn[] {
    return [
      { id: 'to-do', title: 'To Do', tasks: this.toDoTasksFiltered() },
      {
        id: 'in-progress',
        title: 'In Progress',
        tasks: this.inProgressTasksFiltered(),
      },
      {
        id: 'await-feedback',
        title: 'Await Feedback',
        tasks: this.awaitFeedbackTasksFiltered(),
      },
      { id: 'done', title: 'Done', tasks: this.doneTasksFiltered() },
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

  private filterTasksByStatus(status: TaskStatus): Task[] {
    const result = (this.searchResult() ?? '').toLowerCase() || '';
    return this.dbTaskService
      .tasks()
      .filter((t) => t.status === status)
      .filter(
        (t) =>
          !result ||
          t.title.toLowerCase().includes(result) ||
          t.description.toLowerCase().includes(result),
      );
  }

  showDetailDialog = signal(false);

  openDetailDialog() {
    this.showDetailDialog.set(true); // Signal wird TRUE
  }

  closeDetailDialog() {
    this.showDetailDialog.set(false); // Signal wird FALSE
  }
}
