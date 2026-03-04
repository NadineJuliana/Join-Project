import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { ContactsService } from '../../../contacts/services/contacts.service';
import { Contact } from '../../../contacts/models/contact.model';
import { Subtask } from '../../models/subtask.model';

type Priority = 'urgent' | 'medium' | 'low';
type TaskCategory = 'technical-task' | 'user-story';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, InitialsPipe],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {
  private readonly categoryPlaceholder = 'Select task category';
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
  isAssigneesDropdownOpen = signal(false);
  isCategoryDropdownOpen = signal(false);
  categoryOptions: Array<{ value: TaskCategory; label: string }> = [
    { value: 'technical-task', label: 'Technical Task' },
    { value: 'user-story', label: 'User Story' },
  ];
  contacts = computed(() => this.contactsService?.contacts() ?? []);
  assigneeSearchTerm = signal('');
  isAssigneeSearchActive = signal(false);
  filteredContacts = computed(() => {
    const normalizedSearchTerm = this.assigneeSearchTerm().trim().toLowerCase();
    if (!normalizedSearchTerm) {
      return this.contacts();
    }

    return this.contacts().filter((contact) =>
      contact.name.toLowerCase().includes(normalizedSearchTerm),
    );
  });
  subtaskDraft = signal('');
  subtasks = signal<Subtask[]>([]);
  hasSubtaskDraft = computed(() => this.subtaskDraft().trim().length > 0);
  editingSubtaskIndex = signal<number | null>(null);
  editingSubtaskDraft = signal('');
  @ViewChild('assigneeSearchInput')
  assigneeSearchInput?: ElementRef<HTMLInputElement>;

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
    this.resetSubtaskInput();
    this.finishSubtaskEdit();
    this.closeAssigneesDropdown();
    this.closeCategoryDropdown();
  }

  isAssigneeSelected(contactId: number): boolean {
    return this.getSelectedAssigneeIds().includes(String(contactId));
  }

  toggleAssigneesDropdown(): void {
    this.isAssigneesDropdownOpen.update((state) => !state);
  }

  closeAssigneesDropdown(): void {
    this.isAssigneesDropdownOpen.set(false);
    this.isAssigneeSearchActive.set(false);
    this.assigneeSearchTerm.set('');
  }

  activateAssigneeSearch(): void {
    this.isAssigneeSearchActive.set(true);
    this.isAssigneesDropdownOpen.set(true);

    setTimeout(() => {
      this.assigneeSearchInput?.nativeElement.focus();
    });
  }

  toggleAssignee(contact: Contact): void {
    const contactId = String(contact.id);
    const selectedIds = this.getSelectedAssigneeIds();
    const isSelected = selectedIds.includes(contactId);
    const nextSelectedIds = isSelected
      ? selectedIds.filter((id) => id !== contactId)
      : [...selectedIds, contactId];

    this.form.controls.assigneeIds.setValue(nextSelectedIds);
  }

  getAssigneesDisplayLabel(): string {
    const selectedIds = this.getSelectedAssigneeIds();
    const selectedCount = selectedIds.length;
    if (selectedCount === 0) {
      return 'Select contacts to assign';
    }

    if (selectedCount === 1) {
      const selectedId = selectedIds[0];
      const selectedContact = this.contacts().find(
        (contact) => String(contact.id) === selectedId,
      );
      return selectedContact?.name ?? '1 contact selected';
    }

    return `${selectedCount} contacts selected`;
  }

  onAssigneeSearchInput(event: Event): void {
    this.assigneeSearchTerm.set(this.getInputValue(event));
    this.isAssigneesDropdownOpen.set(true);
  }

  getSelectedAssigneeContacts(): Contact[] {
    const selectedIds = new Set(this.getSelectedAssigneeIds());
    return this.contacts().filter((contact) =>
      selectedIds.has(String(contact.id)),
    );
  }

  toggleCategoryDropdown(): void {
    if (this.isCategoryDropdownOpen()) {
      this.closeCategoryDropdown();
      return;
    }

    this.isCategoryDropdownOpen.set(true);
  }

  closeCategoryDropdown(): void {
    if (!this.isCategoryDropdownOpen()) {
      return;
    }

    this.isCategoryDropdownOpen.set(false);
    this.form.controls.category.markAsTouched();
  }

  selectCategory(category: TaskCategory): void {
    this.form.controls.category.setValue(category);
    this.form.controls.category.markAsTouched();
    this.closeCategoryDropdown();
  }

  isCategorySelected(category: TaskCategory): boolean {
    return this.form.controls.category.value === category;
  }

  getCategoryDisplayLabel(): string {
    const selectedCategory = this.form.controls.category.value;
    if (!selectedCategory) {
      return this.categoryPlaceholder;
    }

    return (
      this.categoryOptions.find((option) => option.value === selectedCategory)
        ?.label ?? this.categoryPlaceholder
    );
  }

  onSubtaskInput(event: Event): void {
    this.subtaskDraft.set(this.getInputValue(event));
  }

  resetSubtaskInput(): void {
    this.subtaskDraft.set('');
  }

  saveSubtask(): void {
    const content = this.subtaskDraft().trim();
    if (!content) {
      return;
    }

    this.subtasks.update((currentSubtasks) => [
      ...currentSubtasks,
      new Subtask({ content, completed: false, task_id: 0 }),
    ]);
    this.resetSubtaskInput();
  }

  startSubtaskEdit(index: number): void {
    const subtask = this.subtasks()[index];
    if (!subtask) {
      return;
    }

    this.editingSubtaskIndex.set(index);
    this.editingSubtaskDraft.set(subtask.content);
  }

  onEditingSubtaskInput(event: Event): void {
    this.editingSubtaskDraft.set(this.getInputValue(event));
  }

  saveEditedSubtask(): void {
    const index = this.editingSubtaskIndex();
    if (index === null) {
      return;
    }

    const content = this.editingSubtaskDraft().trim();
    if (!content) {
      return;
    }

    this.subtasks.update((currentSubtasks) =>
      currentSubtasks.map((subtask, currentIndex) =>
        currentIndex === index ? new Subtask({ ...subtask, content }) : subtask,
      ),
    );

    this.finishSubtaskEdit();
  }

  deleteSubtask(index: number): void {
    this.subtasks.update((currentSubtasks) =>
      currentSubtasks.filter((_, currentIndex) => currentIndex !== index),
    );

    const currentEditingIndex = this.editingSubtaskIndex();
    if (currentEditingIndex === null) {
      return;
    }

    if (currentEditingIndex === index) {
      this.finishSubtaskEdit();
      return;
    }

    if (index < currentEditingIndex) {
      this.editingSubtaskIndex.set(currentEditingIndex - 1);
    }
  }

  deleteEditingSubtask(): void {
    const index = this.editingSubtaskIndex();
    if (index !== null) {
      this.deleteSubtask(index);
    }
  }

  private finishSubtaskEdit(): void {
    this.editingSubtaskIndex.set(null);
    this.editingSubtaskDraft.set('');
  }

  private getInputValue(event: Event): string {
    const target = event.target as HTMLInputElement | null;
    return target?.value ?? '';
  }

  private getSelectedAssigneeIds(): string[] {
    return this.form.controls.assigneeIds.value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isAssigneesDropdownOpen() && !this.isCategoryDropdownOpen()) {
      return;
    }

    const target = event.target as Node | null;
    if (!target) {
      return;
    }

    const targetElement =
      target instanceof Element ? target : target.parentElement;

    if (!targetElement) {
      this.closeAssigneesDropdown();
      this.closeCategoryDropdown();
      return;
    }

    const clickedInsideAssignees =
      targetElement.closest('.task-form-assignees') !== null;
    const clickedInsideCategory =
      targetElement.closest('.task-form-category') !== null;

    if (!clickedInsideAssignees) {
      this.closeAssigneesDropdown();
    }

    if (!clickedInsideCategory) {
      this.closeCategoryDropdown();
    }
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
