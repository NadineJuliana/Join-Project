import {
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ContactsService } from '../../../contacts/services/contacts.service';
import { Subtask } from '../../models/subtask.model';
import { TaskFormAssigneesComponent } from './components/task-form-assignees/task-form-assignees.component';
import { TaskFormCategoryComponent } from './components/task-form-category/task-form-category.component';
import { TaskFormSubtasksComponent } from './components/task-form-subtasks/task-form-subtasks.component';
import { TasksService } from '../../services/tasks.service';
import { Task, TaskStatus } from '../../models/task.model';
import { Router } from '@angular/router';
import { ToastsService } from '../../../../core/services/toasts.service';

/**
 * @category Task Form
 * @description Component responsible for creating and editing tasks, including assignees,
 * subtasks, priority, category and due date handling.
 */
type Priority = 'urgent' | 'medium' | 'low';
type TaskCategory = 'technical-task' | 'user-story';

@Component({
  selector: 'app-task-form',
  imports: [
    ReactiveFormsModule,
    TaskFormAssigneesComponent,
    TaskFormCategoryComponent,
    TaskFormSubtasksComponent,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {
  /** Angular router for navigation */
  private router = inject(Router);

  /** FormBuilder for creating reactive forms */
  private formBuilder = inject(FormBuilder);

  /** Contacts service to retrieve available assignees */
  contactsService = inject(ContactsService, { optional: true });

  /** Tasks service for task CRUD operations */
  private tasksService = inject(TasksService);

  /** Toast service for feedback messages */
  private toastService = inject(ToastsService);

  /** Emits when a task has been updated */
  taskUpdated = output<Task>();

  /** Emits when a new task has been created */
  taskCreated = output<Task>();

  /** Input task when editing an existing task */
  editTask = input<Task | null>(null);

  /** Initial status for a new task */
  status = input<TaskStatus>('to-do');

  /** Reactive form for task creation/editing */
  form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(35)]],
    description: [''],
    dueDate: ['', [Validators.required, this.notPastDateValidator]],
    assigneeIds: [<string[]>[]],
    category: ['', [Validators.required]],
  });

  /** Minimum selectable due date (today) */
  todayMinDate = this.getTodayMinDate();

  /** Maximum allowed due date */
  maxDueDate = '2100-12-31';

  /** Currently selected priority */
  selectedPriority: Priority = 'medium';

  /** Available category options */
  categoryOptions: Array<{ value: TaskCategory; label: string }> = [
    { value: 'technical-task', label: 'Technical Task' },
    { value: 'user-story', label: 'User Story' },
  ];

  /** Computed list of contacts including current user */
  contacts = computed(() => {
    const all = this.contactsService?.contacts() ?? [];
    const current = this.contactsService?.currentUserContact();
    if (!current) return all;
    return [current, ...all.filter((c) => c.id !== current.id)];
  });

  /** Signal storing subtasks */
  subtasks = signal<Subtask[]>([]);

  /** Flag indicating edit mode */
  isEditMode = signal(false);

  /** Trigger to reset subtasks component */
  subtasksResetTrigger = 0;

  /** Flag preventing multiple submissions */
  isSubmitting = false;

  /** Initializes component and loads contacts if needed */
  async ngOnInit(): Promise<void> {
    if (this.contactsService && !this.contactsService.contactsLoaded) {
      await this.contactsService.getAllContacts();
    }
    if (this.editTask()) {
      this.formForEdit(this.editTask()!);
    }
  }

  /** Select a task priority */
  selectPriority(priority: Priority): void {
    this.selectedPriority = priority;
  }

  /** Check if priority button is active */
  isPrioritySelected(priority: Priority): boolean {
    return this.selectedPriority === priority;
  }

  /** Select a task category */
  selectCategory(category: TaskCategory): void {
    this.form.controls.category.setValue(category);
    this.form.controls.category.markAsTouched();
  }

  /** Handle changes to selected assignees */
  onAssigneesChange(assigneeIds: string[]): void {
    this.form.controls.assigneeIds.setValue(assigneeIds);
  }

  /** Mark category control as touched */
  markCategoryAsTouched(): void {
    this.form.controls.category.markAsTouched();
  }

  /** Handle subtasks changes */
  onSubtasksChange(subtasks: Subtask[]): void {
    this.subtasks.set(subtasks);
  }

  /** Resets the task form and clears subtasks */
  clearTaskForm(): void {
    this.form.reset({
      title: '',
      description: '',
      dueDate: '',
      assigneeIds: [],
      category: '',
    });
    this.selectedPriority = 'medium';
    this.subtasks.set([]);
    this.subtasksResetTrigger += 1;
  }

  /** Handles task submission for both create and edit modes */
  async submitTask(): Promise<void> {
    if (this.form.invalid) {
      this.markFormAsTouched();
      return;
    }
    this.isSubmitting = true;
    if (this.editTask()) {
      const task = this.editTask()!;
      await this.submitEditTask(this.editTask()!);
      this.isEditMode.set(false);
    } else {
      const newTask = await this.createNewTask();
      this.refreshTaskOnBoard(newTask);
      this.taskCreated.emit(newTask);
      this.clearTaskForm();
      this.createToastMessage();
      setTimeout(() => {
        this.router.navigate(['/board']);
      }, 500);
    }
    this.isSubmitting = false;
  }

  /** Marks all form controls as touched */
  private markFormAsTouched(): void {
    Object.values(this.form.controls).forEach((control) =>
      control.markAsTouched(),
    );
  }

  /** Creates and persists a new task */
  async createNewTask(): Promise<Task> {
    const task = new Task({
      title: this.form.value.title,
      description: this.form.value.description,
      due_date: this.form.value.dueDate,
      category: this.form.value.category as TaskCategory,
      status: this.status(),
      position: 0,
      priority: this.selectedPriority,
      subtasks: this.subtasks(),
      assignees: this.getSelectedAssignees(),
    });
    const savedTask = await this.tasksService.addTask(task);
    await this.saveSubtasks(savedTask.id);
    await this.saveAssignees(savedTask.id);
    this.tasksService.handleInsertTask(savedTask);
    return savedTask;
  }

  /** Returns selected assignee contact objects */
  private getSelectedAssignees() {
    const ids: string[] = this.form.value.assigneeIds || [];
    return this.contacts()?.filter((c) => ids.includes(String(c.id))) ?? [];
  }

  /** Saves subtasks to the backend */
  private async saveSubtasks(taskId: number) {
    for (const subtask of this.subtasks()) {
      subtask.task_id = taskId;
      if (!subtask.id) {
        await this.tasksService.addSubtask(subtask);
      } else {
        await this.tasksService.updateSubtask(subtask);
      }
    }
  }

  /** Saves task assignees */
  private async saveAssignees(taskId: number) {
    const assignees = this.getSelectedAssignees();
    for (const assignee of assignees) {
      const task = this.editTask();
      const alreadyAssigned = task?.assignees?.some(
        (a) => a.id === assignee.id,
      );
      if (!alreadyAssigned) {
        await this.tasksService.addAssignee(taskId, assignee.id);
      }
    }
  }

  /**
   * Updates an existing task including basic data, assignees and subtasks.
   * Afterwards refreshes the board state and emits the update event.
   */
  private async submitEditTask(task: Task): Promise<void> {
    this.updateTaskBasicInfo(task);
    await this.updateTaskAssignees(task);
    await this.updateTaskSubtasks(task);
    await this.tasksService.updateTask(task);
    this.refreshTaskOnBoard(task);
    this.taskUpdated.emit(task);
    this.isEditMode.set(false);
  }

  /** Updates the task state in the board signal after editing */
  private refreshTaskOnBoard(task: Task): void {
    this.tasksService.handleInsertTask({
      ...task,
      subtasks: this.subtasks(),
      assignees: this.getSelectedAssignees(),
    });
  }

  /** Updates the basic task properties from the form values */
  private updateTaskBasicInfo(task: Task): void {
    task.title = this.form.value.title ?? '';
    task.description = this.form.value.description ?? '';
    task.due_date = this.form.value.dueDate ?? '';
    task.priority = this.selectedPriority;
    task.category = this.form.value.category as TaskCategory;
  }

  /** Synchronizes task assignees with the backend by adding new ones and removing unselected ones */
  private async updateTaskAssignees(task: Task): Promise<void> {
    const selectedAssignees = this.getSelectedAssignees();
    const existingIds = task.assignees?.map((a) => a.id) ?? [];
    for (const assignee of selectedAssignees) {
      if (!existingIds.includes(assignee.id)) {
        await this.tasksService.addAssignee(task.id, assignee.id);
      }
    }
    for (const oldAssignee of task.assignees ?? []) {
      if (!selectedAssignees.some((a) => a.id === oldAssignee.id)) {
        await this.tasksService.removeAssignee(task.id, oldAssignee.id);
      }
    }
    task.assignees = [...selectedAssignees];
  }

  /**
   * Synchronizes task subtasks with the backend.
   * New subtasks are created and existing ones updated.
   */
  private async updateTaskSubtasks(task: Task): Promise<void> {
    const existingIds = task.subtasks?.map((s) => s.id) ?? [];
    for (const subtask of this.subtasks()) {
      if (!subtask.id) {
        subtask.task_id = task.id;
        await this.tasksService.addSubtask(subtask);
      } else {
        await this.tasksService.updateSubtask(subtask);
      }
    }
    task.subtasks = [...this.subtasks()];
  }

  /** Returns today's date formatted as YYYY-MM-DD to be used as the minimum selectable due date */
  private getTodayMinDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const monthNumber = now.getMonth() + 1;
    const dayNumber = now.getDate();
    const month = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
    const day = dayNumber < 10 ? `0${dayNumber}` : `${dayNumber}`;
    return `${year}-${month}-${day}`;
  }

  /** Prefills the form when editing an existing task */
  private formForEdit(task: Task) {
    this.form.patchValue({
      title: task.title,
      description: task.description,
      dueDate: task.due_date,
      category: task.category,
      assigneeIds: task.assignees?.map((a) => String(a.id)) ?? [],
    });
    this.selectedPriority = task.priority;
    this.subtasks.set(task.subtasks ?? []);
  }

  /** Custom validator preventing past dates */
  private notPastDateValidator(
    control: AbstractControl<string>,
  ): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(control.value)) {
      return { invalidDate: true };
    }
    const selectedDate = new Date(control.value);
    if (Number.isNaN(selectedDate.getTime())) {
      return { invalidDate: true };
    }
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today ? { pastDate: true } : null;
  }

  /** Displays a toast message after task creation */
  private createToastMessage() {
    this.toastService.showToast({
      message: 'Task added to board',
      classname: 'toast__added',
      icon: 'board_icon_gray.svg',
      position: 'center',
      duration: 1000,
    });
  }
}
