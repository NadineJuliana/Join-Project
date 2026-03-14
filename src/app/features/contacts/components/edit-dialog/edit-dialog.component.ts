import { Component, inject, input, output } from '@angular/core';
import { Contact } from '../../models/contact.model';
import { ContactsService } from '../../services/contacts.service';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';

/**
 * @category Contacts
 * @description Dialog component used to edit or delete an existing contact.
 * Displays the contact form with initial values and handles update/delete operations.
 */
@Component({
  selector: 'app-edit-dialog',
  imports: [ContactFormComponent, InitialsPipe],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.scss',
})
export class EditDialogComponent {
  /** Injected ContactsService */
  private contactsService = inject(ContactsService);

  /** Emits when the dialog should close */
  closeDialog = output<void>();

  /** Contact passed into the dialog */
  contact = input<Contact | null>(null);

  /** Currently selected contact signal from the service */
  selectedContact = this.contactsService.selectedContact;

  /** Close the dialog */
  onClose() {
    this.closeDialog.emit();
  }

  /** Update an existing contact */
  async onSaveContact(contact: Contact) {
    const originalContact = this.contact();
    if (!originalContact) return;
    contact.id = originalContact.id;
    await this.contactsService.updateContact(contact);
    this.onClose();
  }

  /** Delete the current contact */
  async onDeleteContact() {
    const contact = this.contact();
    if (!contact) return;
    try {
      await this.contactsService.deleteContact(contact.id);
      this.onClose();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }
}
