import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
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

type Priority = 'urgent' | 'medium' | 'low';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, InitialsPipe],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private contactsService = inject(ContactsService, { optional: true });
  private elementRef = inject(ElementRef<HTMLElement>);

  form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(35)]],
    dueDate: ['', [Validators.required, this.notPastDateValidator]],
    assigneeIds: [<number[]>[]],
  });

  todayMinDate = this.getTodayMinDate();
  selectedPriority: Priority = 'medium';
  isAssigneesDropdownOpen = signal(false);
  contacts = computed(() => this.contactsService?.contacts() ?? []);
  selectedAssigneeContacts = computed(() => {
    const selectedIds = this.form.controls.assigneeIds.value;
    return this.contacts().filter((contact) =>
      selectedIds.includes(contact.id),
    );
  });

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

  toggleAssigneesDropdown(): void {
    this.isAssigneesDropdownOpen.update((state) => !state);
  }

  closeAssigneesDropdown(): void {
    this.isAssigneesDropdownOpen.set(false);
  }

  isAssigneeSelected(contactId: number): boolean {
    return this.form.controls.assigneeIds.value.includes(contactId);
  }

  toggleAssignee(contact: Contact): void {
    const selectedIds = this.form.controls.assigneeIds.value;
    const isSelected = selectedIds.includes(contact.id);
    const nextSelectedIds = isSelected
      ? selectedIds.filter((id) => id !== contact.id)
      : [...selectedIds, contact.id];

    this.form.controls.assigneeIds.setValue(nextSelectedIds);
  }

  getAssigneesDisplayLabel(): string {
    const selectedCount = this.form.controls.assigneeIds.value.length;
    if (selectedCount === 0) {
      return 'Select contacts to assign';
    }

    if (selectedCount === 1) {
      return this.selectedAssigneeContacts()[0]?.name ?? '1 contact selected';
    }

    return `${selectedCount} contacts selected`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isAssigneesDropdownOpen()) {
      return;
    }

    const target = event.target as Node | null;
    if (!target) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeAssigneesDropdown();
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
