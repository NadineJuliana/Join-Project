import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Contact } from '../../models/contact.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { EllipsisPipe } from '../../../../shared/pipes/ellipsis.pipe';

/**
 * @category Contact Page Components
 * @description Displays a list of contacts, grouped alphabetically, with select/add events.
 */
  @Component({
    selector: 'app-contacts-list',
    standalone: true,
    imports: [InitialsPipe, EllipsisPipe],
    templateUrl: './contacts-list.component.html',
    styleUrl: './contacts-list.component.scss',
  })
  export class ContactsListComponent {
    /** Grouped contacts to display */
      @Input() groupedContacts: any[] = [];

    /** Emitted when a contact is selected */
      @Output() selectContact = new EventEmitter<Contact>();

    /** Emitted when add contact action is triggered */
      @Output() addContact = new EventEmitter<void>();

    /** Currently active contact id */
      activeContactId: number | string | null = null;

    /** Handle contact click */
      onContactClick(contact: Contact) {
        this.activeContactId = contact.id;
        this.selectContact.emit(contact);
      }
  }
