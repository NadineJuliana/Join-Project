import { Component, inject, signal } from '@angular/core';
import { ContactsListComponent } from '../../components/contacts-list/contacts-list.component';
import { ContactDetailsComponent } from '../../components/contact-details/contact-details.component';
import { ContactDialogComponent } from '../../components/contact-dialog/contact-dialog.component';
import { EditDialogComponent } from '../../components/edit-dialog/edit-dialog.component';
import { ContactsService } from '../../services/contacts.service';
import { Contact } from '../../models/contact.model';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';

/**
 * @category Pages
 * @description Main page component for displaying, adding, editing, and deleting contacts.
 */
@Component({
  selector: 'app-contacts-page',
  imports: [
    ContactsListComponent,
    ContactDetailsComponent,
    ContactDialogComponent,
    EditDialogComponent,
    ToastComponent,
  ],

  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.scss',
})
export class ContactsPageComponent {
  /** Injected ContactsService */
  dbService = inject(ContactsService);

  /** Computed grouped contacts from service */
  groupedContacts = this.dbService.groupedContacts;

  /** Currently selected contact from service */
  selectedContact = this.dbService.selectedContact;

  /** Flag to show/hide contact dialog */
  showContactDialog = signal(false);

  /** Flag to show/hide edit dialog */
  showEditDialog = signal(false);

  /** Flag for mobile view */
  isMobile = signal(false);

  /** Initialize page: load contacts, init realtime, setup mobile detection */
  async ngOnInit() {
    await this.dbService.getAllContacts();
    this.dbService.initRealtime();
    this.setupMobileDetection();
    if (this.isMobile()) {
      this.dbService.selectedContact.set(null);
    }
  }

  /** Setup mobile detection */
  private setupMobileDetection() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    this.isMobile.set(mediaQuery.matches);
    mediaQuery.addEventListener('change', (event) => {
      this.isMobile.set(event.matches);
    });
  }

  /** Handle contact selection */
  onSelectContact(contact: Contact) {
    this.dbService.selectContact(contact);
  }

  /** Go back to contacts list */
  onBackToList() {
    this.dbService.selectedContact.set(null);
  }

  /** Open new contact dialog */
  openContactDialog() {
    this.showContactDialog.set(true);
  }

  /** Close new contact dialog */
  closeContactDialog() {
    this.showContactDialog.set(false);
  }

  /** Open edit contact dialog */
  openEditDialog() {
    this.showEditDialog.set(true);
  }

  /** Close edit contact dialog */
  closeEditDialog() {
    this.showEditDialog.set(false);
  }

  /** Delete currently selected contact */
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
