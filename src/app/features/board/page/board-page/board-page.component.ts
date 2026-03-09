import { TaskDialogComponent } from './../../../tasks/components/task-dialog/task-dialog.component';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TasksService } from '../../../tasks/services/tasks.service';
import { ContactsService } from '../../../contacts/services/contacts.service';
import { Task, TaskStatus } from '../../../tasks/models/task.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { EllipsisPipe } from '../../../../shared/pipes/ellipsis.pipe';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DetailDialogComponent } from '../../components/detail-dialog/detail-dialog.component';
import { Subtask } from '../../../tasks/models/subtask.model';
import { Router } from '@angular/router';

// Interface - Definiert die Struktur einer Spalte
export interface BoardColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

interface MoveTarget {
  id: TaskStatus;
  title: string;
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
    TaskDialogComponent,
  ],
  templateUrl: './board-page.component.html',
  styleUrl: './board-page.component.scss',
})
export class BoardPageComponent {
  dbContactService = inject(ContactsService);
  dbTaskService = inject(TasksService);
  router = inject(Router);
  activeDropListId: string | null = null;
  searchControl = new FormControl('');

  isMobile = signal(false);
  showDetailDialog = signal(false);
  selectedTask = signal<Task | null>(null); // Default ist die Task auf null
  showAddTaskDialog = signal(false);
  addTaskStatus = signal<TaskStatus>('to-do');
  openCategoryMenuTaskId = signal<number | null>(null);
  searchResult = toSignal(this.searchControl.valueChanges, {
    initialValue: '',
  });

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openCategoryMenuTaskId.set(null);
  }

  toDoTasksFiltered = computed(() => this.filterTasksByStatus('to-do'));
  inProgressTasksFiltered = computed(() =>
    this.filterTasksByStatus('in-progress'),
  );
  awaitFeedbackTasksFiltered = computed(() =>
    this.filterTasksByStatus('await-feedback'),
  );
  doneTasksFiltered = computed(() => this.filterTasksByStatus('done'));

  async ngOnInit() {
    this.setupMobileDetection();
    this.dbContactService.initRealtime();
    this.dbTaskService.initRealtime();
    await this.dbContactService.getAllContacts();
    await this.dbTaskService.initialize();
  }

  boardColumns = computed<BoardColumn[]>(() => [
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
  ]);

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
    this.activeDropListId = null;
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
        return 'icons/low_icon.svg';
      case 'medium':
        return 'icons/medium_icon.svg';
      case 'urgent':
        return 'icons/urgent_icon.svg';
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

  private setupMobileDetection() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    this.isMobile.set(mediaQuery.matches);

    mediaQuery.addEventListener('change', (event) => {
      this.isMobile.set(event.matches);
    });
  }

  openDetailDialog(task: Task) {
    this.selectedTask.set(task); // SelectedTask speichert die Task
    this.showDetailDialog.set(true); // Signal wird TRUE
  }

  closeDetailDialog() {
    this.showDetailDialog.set(false); // Signal wird FALSE
    this.selectedTask.set(null); // SelectedTask wird auf null zurückgesetzt
  }

  openAddTaskDialog(status: TaskStatus = 'to-do'): void {
    if (this.isMobile()) {
      this.router.navigate(['/add-task'], {
        queryParams: { status },
      });
      return;
    }
    this.addTaskStatus.set(status);
    this.showAddTaskDialog.set(true);
  }

  closeAddTaskDialog(): void {
    this.showAddTaskDialog.set(false);
  }

  onTaskCreated(task: Task): void {
    this.closeAddTaskDialog();
  }

  toggleTaskCategoryMenu(taskId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openCategoryMenuTaskId.update((currentTaskId) =>
      currentTaskId === taskId ? null : taskId,
    );
  }

  isTaskCategoryMenuOpen(taskId: number): boolean {
    return this.openCategoryMenuTaskId() === taskId;
  }

  getMoveTargets(task: Task): MoveTarget[] {
    return this.boardColumns()
      .filter((column) => column.id !== task.status)
      .map((column) => ({ id: column.id, title: column.title }));
  }

  async moveTaskToStatus(
    task: Task,
    targetStatus: TaskStatus,
    event: MouseEvent,
  ): Promise<void> {
    event.stopPropagation();

    if (task.status === targetStatus) {
      this.openCategoryMenuTaskId.set(null);
      return;
    }

    const targetColumn = this.boardColumns().find(
      (column) => column.id === targetStatus,
    );
    if (!targetColumn) {
      this.openCategoryMenuTaskId.set(null);
      return;
    }

    const targetTasks = [
      ...targetColumn.tasks.filter((t) => t.id !== task.id),
      task,
    ];
    await this.dbTaskService.moveTaskAndReorder(
      task,
      targetTasks,
      targetStatus,
    );
    this.dbTaskService.updateTaskSignal(task);
    this.openCategoryMenuTaskId.set(null);
  }
}
