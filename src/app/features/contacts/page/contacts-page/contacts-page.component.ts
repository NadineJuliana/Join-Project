import { Component, inject } from '@angular/core';
import { ContactsService } from '../../services/contacts.service';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-contacts-page',
  imports: [],
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.scss',
})
export class ContactsPageComponent {
  dbService = inject(ContactsService);

  contactList = this.dbService.contacts;
  groupedContacts = this.dbService.groupedContacts;
  selectedContact = this.dbService.selectedContact;

  ngOnInit() {
    this.dbService.getAllContacts();
    this.dbService.selectedContact.set(null);
  }

  onSelectContact(contact: Contact) {
    this.dbService.selectContact(contact);
  }
}
