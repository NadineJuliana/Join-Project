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
import { Router } from '@angular/router';

/** Interface defining a board column */
  export interface BoardColumn {
    id: TaskStatus;
    title: string;
    tasks: Task[];
  }

/** Internal interface for task move targets */
  interface MoveTarget {
    id: TaskStatus;
    title: string;
  }

/**
 * @category Pages
 * @description Board page component displaying tasks in a Kanban-style board with drag-and-drop, filtering, and task dialogs.
 */
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
    /** Injected ContactsService for accessing contacts */
      dbContactService = inject(ContactsService);

    /** Injected TasksService for accessing tasks */
      dbTaskService = inject(TasksService);

    /** Injected Router */
      router = inject(Router);

    /** Currently active drop list id during drag-and-drop */
      activeDropListId: string | null = null;

    /** Search form control for filtering tasks */
      searchControl = new FormControl('');

    /** Flag for mobile view */
      isMobile = signal(false);

    /** Flag to show/hide task detail dialog */
      showDetailDialog = signal(false);

    /** Currently selected task for detail dialog */
      selectedTask = signal<Task | null>(null);

    /** Flag to show/hide add-task dialog */
      showAddTaskDialog = signal(false);

    /** Status for the task to be added */
      addTaskStatus = signal<TaskStatus>('to-do');

    /** Task id for which category menu is open */
      openCategoryMenuTaskId = signal<number | null>(null);

    /** Signal to track search results */
      searchResult = toSignal(this.searchControl.valueChanges, {
        initialValue: '',
      });

    /** Close category menu on any document click */
      @HostListener('document:click')
      onDocumentClick(): void {
        this.openCategoryMenuTaskId.set(null);
      }

    /** Computed filtered tasks per status */
      toDoTasksFiltered = computed(() => this.filterTasksByStatus('to-do'));
      inProgressTasksFiltered = computed(() =>
        this.filterTasksByStatus('in-progress'),
      );
      awaitFeedbackTasksFiltered = computed(() =>
        this.filterTasksByStatus('await-feedback'),
      );
      doneTasksFiltered = computed(() => this.filterTasksByStatus('done'));

    /** Initialize component: setup mobile detection, realtime, and load tasks/contacts */
      async ngOnInit() {
        this.setupMobileDetection();
        this.dbContactService.initRealtime();
        this.dbTaskService.initRealtime();
        await this.dbContactService.getAllContacts();
        await this.dbTaskService.initialize();
      }

    /** Computed board columns for Kanban display */
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

    /** Handle task drag-and-drop event */
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

    /** Called when a drag enters a column */
      onDropListEntered(columnId: string): void {
        this.activeDropListId = columnId;
      }

    /** Called when a drag exits a column */
      onDropListExited(columnId: string): void {
        this.activeDropListId = null;
      }

    /** Get icon name for task priority */
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

    /** Filter tasks by status and search result */
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

    /** Setup mobile detection using window.matchMedia */
      private setupMobileDetection() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        this.isMobile.set(mediaQuery.matches);
        mediaQuery.addEventListener('change', (event) => {
          this.isMobile.set(event.matches);
        });
      }

    /** Open task detail dialog for a selected task */
      openDetailDialog(task: Task) {
        this.selectedTask.set(task);
        this.showDetailDialog.set(true);
      }

    /** Close task detail dialog */
      closeDetailDialog() {
        this.showDetailDialog.set(false);
        this.selectedTask.set(null);
      }

    /** Open add-task dialog, navigate to separate page on mobile */
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

    /** Close add-task dialog */
      closeAddTaskDialog(): void {
        this.showAddTaskDialog.set(false);
      }

    /** Called when a task is created */
      onTaskCreated(task: Task): void {
        this.closeAddTaskDialog();
      }

    /** Toggle category menu for a task */
      toggleTaskCategoryMenu(taskId: number, event: MouseEvent): void {
        event.stopPropagation();
        this.openCategoryMenuTaskId.update((currentTaskId) =>
          currentTaskId === taskId ? null : taskId,
        );
      }

    /** Check if category menu is open for a task */
      isTaskCategoryMenuOpen(taskId: number): boolean {
        return this.openCategoryMenuTaskId() === taskId;
      }

    /** Get valid move targets for a task (other columns) */
      getMoveTargets(task: Task): MoveTarget[] {
        return this.boardColumns()
          .filter((column) => column.id !== task.status)
          .map((column) => ({ id: column.id, title: column.title }));
      }

    /** Move a task to a new status column */
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
