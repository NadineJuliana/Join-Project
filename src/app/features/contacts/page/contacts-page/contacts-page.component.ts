import { Component, inject } from '@angular/core';
import { ContactsService } from '../../services/contacts.service';


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

  ngOnInit() {
    this.dbService.getAllContacts();
  }
}
