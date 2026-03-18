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

/**
 * @category Task Form Components
 * @description Component for selecting and managing task assignees with search and dropdown functionality.
 */
  @Component({
    selector: 'app-task-form-assignees',
    imports: [InitialsPipe],
    templateUrl: './task-form-assignees.component.html',
    styleUrl: './task-form-assignees.component.scss',
  })
  export class TaskFormAssigneesComponent {
    /** All available contacts that can be assigned */
      contacts = input.required<Contact[]>();

    /** Currently selected assignee ids */
      selectedAssigneeIds = input<string[]>([]);

    /** Current logged-in user id */
      currentUserId = input<number | null>(null);

    /** Output event when selected assignees change */
      selectedAssigneeIdsChange = output<string[]>();

    /** Flag controlling dropdown visibility */
      isDropdownOpen = signal(false);

    /** Search term for filtering contacts */
      assigneeSearchTerm = signal('');

    /** Flag if search mode is active */
      isAssigneeSearchActive = signal(false);

    /** Computed list of selected assignee contacts */
      selectedAssigneeContacts = computed(() => {
        const selectedIds = new Set(this.selectedAssigneeIds());
        return this.contacts().filter((contact) =>
          selectedIds.has(String(contact.id)),
        );
      });

    /** Display label summarizing selected assignees */
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

    /** Filtered contacts based on search term */
      filteredContacts = computed(() => {
        const term = this.assigneeSearchTerm().toLowerCase().trim();
        if (!term) return this.contacts();
        return this.contacts().filter((c) => c.name.toLowerCase().includes(term));
      });

    /** Reference to the assignee search input */
      @ViewChild('assigneeSearchInput')
      assigneeSearchInput?: ElementRef<HTMLInputElement>;

    /** Close dropdown when clicking outside the component */
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

    /** Activate assignee search input */
      activateSearch(): void {
        this.isAssigneeSearchActive.set(true);
        this.isDropdownOpen.set(true);
        setTimeout(() => {
          this.assigneeSearchInput?.nativeElement.focus();
        });
      }

    /** Update search term when typing in search field */
      onSearchInput(event: Event): void {
        this.assigneeSearchTerm.set(this.getInputValue(event));
        this.isDropdownOpen.set(true);
      }

    /** Handle click inside search input */
      onSearchInputClick(): void {
        if (!this.isDropdownOpen()) {
          return;
        }
        this.isDropdownOpen.set(false);
      }

    /** Toggle dropdown using arrow button */
      toggleSearchDropdownFromArrow(): void {
        const shouldOpen = !this.isDropdownOpen();
        this.isDropdownOpen.set(shouldOpen);
        if (!shouldOpen) {
          this.assigneeSearchInput?.nativeElement.blur();
        }
      }

    /** Toggle assignment state for a contact */
      toggleAssignee(contact: Contact): void {
        const contactId = String(contact.id);
        const selectedIds = this.selectedAssigneeIds();
        const isSelected = selectedIds.includes(contactId);
        const nextSelectedIds = isSelected
          ? selectedIds.filter((id) => id !== contactId)
          : [...selectedIds, contactId];
        this.selectedAssigneeIdsChange.emit(nextSelectedIds);
      }

    /** Check if a contact is currently selected */
      isAssigneeSelected(contactId: number): boolean {
        return this.selectedAssigneeIds().includes(String(contactId));
      }

    /** Check if the contact is the current logged-in user */
      isCurrentUser(contact: Contact): boolean {
        return contact.id === this.currentUserId();
      }

    /** Close dropdown and reset search */
      private closeDropdown(): void {
        this.isDropdownOpen.set(false);
        this.isAssigneeSearchActive.set(false);
        this.assigneeSearchTerm.set('');
      }

    /** Extract input value from event */
      private getInputValue(event: Event): string {
        const target = event.target as HTMLInputElement | null;
        return target?.value ?? '';
      }

    /** Safely resolve the event target element */
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
