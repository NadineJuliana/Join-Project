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
  taskCreated = output<Task>();
  status = input<TaskStatus>('to-do');

  form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(35)]],
    description: [''],
    dueDate: ['', [Validators.required, this.notPastDateValidator]],
    assigneeIds: [<string[]>[]],
    category: ['', [Validators.required]],
  });

  todayMinDate = this.getTodayMinDate();
  maxDueDate = '9999-12-31';
  selectedPriority: Priority = 'medium';
  categoryOptions: Array<{ value: TaskCategory; label: string }> = [
    { value: 'technical-task', label: 'Technical Task' },
    { value: 'user-story', label: 'User Story' },
  ];
  contacts = computed(() => this.contactsService?.contacts() ?? []);
  subtasks = signal<Subtask[]>([]);
  subtasksResetTrigger = 0;

  async ngOnInit(): Promise<void> {
    if (this.contactsService && !this.contactsService.contactsLoaded) {
      await this.contactsService.getAllContacts();
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
    const task = this.createNewTask();
    const savedTask = await this.tasksService.addTask(task);
    await this.saveSubtasks(savedTask.id);
    await this.saveAssignees(savedTask.id);
    this.insertTaskIntoBoard(savedTask);
    this.taskCreated.emit(savedTask);
    this.clearTaskForm();
    this.createToastMessage();
    setTimeout(() => {
      this.router.navigate(['/board']);
    }, 500);
  }

  private markFormAsTouched(): void {
    Object.values(this.form.controls).forEach((control) =>
      control.markAsTouched(),
    );
  }

  private createNewTask(): Task {
    const category = this.form.value.category as
      | 'technical-task'
      | 'user-story'
      | undefined;
    return new Task({
      title: this.form.value.title,
      description: this.form.value.description,
      due_date: this.form.value.dueDate,
      category: category ?? 'user-story',
      status: this.status(),
      position: 0,
      priority: this.selectedPriority,
      subtasks: this.subtasks(),
      assignees: this.getSelectedAssignees(),
    });
  }

  private getSelectedAssignees() {
    const ids: string[] = this.form.value.assigneeIds || [];
    return this.contacts()?.filter((c) => ids.includes(String(c.id))) ?? [];
  }

  private async saveSubtasks(taskId: number) {
    const subtasks = this.subtasks();
    await Promise.all(
      subtasks.map(async (subtask) => {
        subtask.task_id = taskId;
        await this.tasksService.addSubtask(subtask);
      }),
    );
  }

  private async saveAssignees(taskId: number) {
    const assignees = this.getSelectedAssignees();
    await Promise.all(
      assignees.map(async (assignee) => {
        await this.tasksService.addAssignee(taskId, assignee.id);
      }),
    );
  }

  private insertTaskIntoBoard(task: Task): void {
    this.tasksService.handleInsertTask({
      ...task,
      subtasks: this.subtasks(),
      assignees: this.getSelectedAssignees(),
    });
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
