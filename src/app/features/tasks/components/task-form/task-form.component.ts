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
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private contactsService = inject(ContactsService, { optional: true });
  private tasksService = inject(TasksService);
  private toastService = inject(ToastsService);

  taskUpdated = output<Task>();
  taskCreated = output<Task>();
  editTask = input<Task | null>(null);
  status = input<TaskStatus>('to-do');

  form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(35)]],
    description: [''],
    dueDate: ['', [Validators.required, this.notPastDateValidator]],
    assigneeIds: [<string[]>[]],
    category: ['', [Validators.required]],
  });

  todayMinDate = this.getTodayMinDate();
  maxDueDate = '2100-12-31';
  selectedPriority: Priority = 'medium';
  categoryOptions: Array<{ value: TaskCategory; label: string }> = [
    { value: 'technical-task', label: 'Technical Task' },
    { value: 'user-story', label: 'User Story' },
  ];
  contacts = computed(() => this.contactsService?.contacts() ?? []);
  subtasks = signal<Subtask[]>([]);
  isEditMode = signal(false);
  subtasksResetTrigger = 0;

  async ngOnInit(): Promise<void> {
    if (this.contactsService && !this.contactsService.contactsLoaded) {
      await this.contactsService.getAllContacts();
    }
    if (this.editTask()) {
      this.formForEdit(this.editTask()!);
    }
  }

  selectPriority(priority: Priority): void {
    this.selectedPriority = priority;
  }

  isPrioritySelected(priority: Priority): boolean {
    return this.selectedPriority === priority;
  }

  selectCategory(category: TaskCategory): void {
    this.form.controls.category.setValue(category);
    this.form.controls.category.markAsTouched();
  }

  onAssigneesChange(assigneeIds: string[]): void {
    this.form.controls.assigneeIds.setValue(assigneeIds);
  }

  markCategoryAsTouched(): void {
    this.form.controls.category.markAsTouched();
  }

  onSubtasksChange(subtasks: Subtask[]): void {
    this.subtasks.set(subtasks);
  }

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

  async submitTask(): Promise<void> {
    if (this.form.invalid) {
      this.markFormAsTouched();
      return;
    }
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
  }

  private markFormAsTouched(): void {
    Object.values(this.form.controls).forEach((control) =>
      control.markAsTouched(),
    );
  }

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

  private getSelectedAssignees() {
    const ids: string[] = this.form.value.assigneeIds || [];
    return this.contacts()?.filter((c) => ids.includes(String(c.id))) ?? [];
  }

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

  private async submitEditTask(task: Task): Promise<void> {
    this.updateTaskBasicInfo(task);
    await this.updateTaskAssignees(task);
    await this.updateTaskSubtasks(task);
    await this.tasksService.updateTask(task);
    this.refreshTaskOnBoard(task);
    this.taskUpdated.emit(task);
    this.isEditMode.set(false);
  }

  private refreshTaskOnBoard(task: Task): void {
    this.tasksService.handleInsertTask({
      ...task,
      subtasks: this.subtasks(),
      assignees: this.getSelectedAssignees(),
    });
  }

  private updateTaskBasicInfo(task: Task): void {
    task.title = this.form.value.title ?? '';
    task.description = this.form.value.description ?? '';
    task.due_date = this.form.value.dueDate ?? '';
    task.priority = this.selectedPriority;
    task.category = this.form.value.category as TaskCategory;
  }

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

  private getTodayMinDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const monthNumber = now.getMonth() + 1;
    const dayNumber = now.getDate();
    const month = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
    const day = dayNumber < 10 ? `0${dayNumber}` : `${dayNumber}`;
    return `${year}-${month}-${day}`;
  }

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

  private createToastMessage() {
    this.toastService.showToast({
      message: 'Task added to board',
      classname: 'toast__added',
      icon: 'icons/nav-icons/board_icon_gray.svg',
      position: 'center',
      duration: 1000,
    });
  }
}
