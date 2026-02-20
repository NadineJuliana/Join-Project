import { Component, inject, signal } from '@angular/core';
import { ContactsService } from '../../services/contacts.service';
import { Contact } from '../../models/contact.model';
import { ContactDialogComponent } from '../../components/contact-dialog/contact-dialog.component';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-contacts-page',
  imports: [ContactDialogComponent, InitialsPipe],
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.scss',
})
export class ContactsPageComponent {
  dbService = inject(ContactsService);

  contactList = this.dbService.contacts;
  groupedContacts = this.dbService.groupedContacts;
  selectedContact = this.dbService.selectedContact;
  showContactDialog = signal(false);

  async ngOnInit() {
    await this.dbService.getAllContacts();
    this.dbService.selectedContact.set(null);
  }

  onSelectContact(contact: Contact) {
    this.dbService.selectContact(contact);
  }

  openContactDialog() {
    this.showContactDialog.set(true);
  }

  closeContactDialog() {
    this.showContactDialog.set(false);
  }
}
