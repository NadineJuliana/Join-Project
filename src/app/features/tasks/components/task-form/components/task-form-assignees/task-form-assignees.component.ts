import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { InitialsPipe } from '../../../../../../shared/pipes/initials.pipe';
import { Contact } from '../../../../../contacts/models/contact.model';

@Component({
  selector: 'app-task-form-assignees',
  imports: [InitialsPipe],
  templateUrl: './task-form-assignees.component.html',
  styleUrl: './task-form-assignees.component.scss',
})
export class TaskFormAssigneesComponent {
  contacts = input.required<Contact[]>();
  selectedAssigneeIds = input<string[]>([]);
  selectedAssigneeIdsChange = output<string[]>();

  isDropdownOpen = signal(false);
  assigneeSearchTerm = signal('');
  isAssigneeSearchActive = signal(false);

  selectedAssigneeContacts = computed(() => {
    const selectedIds = new Set(this.selectedAssigneeIds());
    return this.contacts().filter((contact) =>
      selectedIds.has(String(contact.id)),
    );
  });

  assigneesDisplayLabel = computed(() => {
    const selectedIds = this.selectedAssigneeIds();
    const selectedCount = selectedIds.length;
    if (selectedCount === 0) {
      return 'Select contacts to assign';
    }
    if (selectedCount === 1) {
      const selectedContact = this.contacts().find(
        (contact) => String(contact.id) === selectedIds[0],
      );
      return selectedContact?.name ?? '1 contact selected';
    }

    return `${selectedCount} contacts selected`;
  });

  filteredContacts = computed(() => {
    const term = this.assigneeSearchTerm().toLowerCase().trim();
    if (!term) return this.contacts();
    return this.contacts().filter((c) => c.name.toLowerCase().includes(term));
  });

  @ViewChild('assigneeSearchInput')
  assigneeSearchInput?: ElementRef<HTMLInputElement>;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isDropdownOpen()) {
      return;
    }

    const targetElement = this.getTargetElement(event.target);
    if (
      !targetElement ||
      targetElement.closest('.task-form-assignees') === null
    ) {
      this.closeDropdown();
    }
  }

  activateSearch(): void {
    this.isAssigneeSearchActive.set(true);
    this.isDropdownOpen.set(true);

    setTimeout(() => {
      this.assigneeSearchInput?.nativeElement.focus();
    });
  }

  onSearchInput(event: Event): void {
    this.assigneeSearchTerm.set(this.getInputValue(event));
    this.isDropdownOpen.set(true);
  }

  onSearchInputClick(): void {
    if (!this.isDropdownOpen()) {
      return;
    }

    this.isDropdownOpen.set(false);
  }

  toggleSearchDropdownFromArrow(): void {
    const shouldOpen = !this.isDropdownOpen();
    this.isDropdownOpen.set(shouldOpen);

    if (!shouldOpen) {
      this.assigneeSearchInput?.nativeElement.blur();
    }
  }

  toggleAssignee(contact: Contact): void {
    const contactId = String(contact.id);
    const selectedIds = this.selectedAssigneeIds();
    const isSelected = selectedIds.includes(contactId);
    const nextSelectedIds = isSelected
      ? selectedIds.filter((id) => id !== contactId)
      : [...selectedIds, contactId];

    this.selectedAssigneeIdsChange.emit(nextSelectedIds);
  }

  isAssigneeSelected(contactId: number): boolean {
    return this.selectedAssigneeIds().includes(String(contactId));
  }

  private closeDropdown(): void {
    this.isDropdownOpen.set(false);
    this.isAssigneeSearchActive.set(false);
    this.assigneeSearchTerm.set('');
  }

  private getInputValue(event: Event): string {
    const target = event.target as HTMLInputElement | null;
    return target?.value ?? '';
  }

  private getTargetElement(target: EventTarget | null): Element | null {
    if (!target) {
      return null;
    }

    if (target instanceof Element) {
      return target;
    }

    if (target instanceof Node) {
      return target.parentElement;
    }

    return null;
  }
}
