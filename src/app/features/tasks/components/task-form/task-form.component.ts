import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
  private formBuilder = inject(FormBuilder);
  private contactsService = inject(ContactsService, { optional: true });

  form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(35)]],
    description: [''],
    dueDate: ['', [Validators.required, this.notPastDateValidator]],
    assigneeIds: [<string[]>[]],
    category: ['', [Validators.required]],
  });

  todayMinDate = this.getTodayMinDate();
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

    const selectedDate = new Date(control.value);
    if (Number.isNaN(selectedDate.getTime())) {
      return { invalidDate: true };
    }

    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate < today ? { pastDate: true } : null;
  }
}
