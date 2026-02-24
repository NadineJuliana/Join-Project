import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Contact } from '../../models/contact.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [InitialsPipe],
  templateUrl: './contacts-list.component.html',
  styleUrl: './contacts-list.component.scss',
})
export class ContactsListComponent {
  @Input() groupedContacts: any[] = [];

  @Output() selectContact = new EventEmitter<Contact>();
  @Output() addContact = new EventEmitter<void>();
}
