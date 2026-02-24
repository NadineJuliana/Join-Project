import { Component, inject, signal } from '@angular/core';
import { ContactsListComponent } from '../../components/contacts-list/contacts-list.component';
import { ContactDetailsComponent } from '../../components/contact-details/contact-details.component';
import { ContactDialogComponent } from '../../components/contact-dialog/contact-dialog.component';
import { EditDialogComponent } from '../../components/edit-dialog/edit-dialog.component';
import { ContactsService } from '../../services/contacts.service';
import { Contact } from '../../models/contact.model';
import { ToastComponent } from "../../../../shared/components/toast/toast.component";

@Component({
  selector: 'app-contacts-page',
  imports: [
    ContactsListComponent,
    ContactDetailsComponent,
    ContactDialogComponent,
    EditDialogComponent,
    ToastComponent
],

  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.scss',
})
export class ContactsPageComponent {
  dbService = inject(ContactsService);

  groupedContacts = this.dbService.groupedContacts;
  selectedContact = this.dbService.selectedContact;
  showContactDialog = signal(false);
  showEditDialog = signal(false);

  isMobile = signal(false); // 👈 NEU

  async ngOnInit() {
    await this.dbService.getAllContacts();
    await this.dbService.initRealtime();
    this.dbService.selectedContact.set(null);

    this.setupMobileDetection(); // 👈 NEU
  }

  // 👇 NEU
  private setupMobileDetection() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    this.isMobile.set(mediaQuery.matches);

    mediaQuery.addEventListener('change', (event) => {
      this.isMobile.set(event.matches);
    });
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

  openEditDialog() {
    this.showEditDialog.set(true);
  }

  closeEditDialog() {
    this.showEditDialog.set(false);
  }

  async onDeleteSelectedContact() {
    const contact = this.selectedContact();
    if (!contact) return;

    try {
      await this.dbService.deleteContact(contact.id);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }
}
