import { Component, inject, input, output } from '@angular/core';
import { Contact } from '../../models/contact.model';
import { ContactsService } from '../../services/contacts.service';
import { ContactFormComponent } from '../contact-form/contact-form.component';

@Component({
  selector: 'app-edit-dialog',
  imports: [ContactFormComponent],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.scss',
})
export class EditDialogComponent {
  private contactsService = inject(ContactsService);

  closeDialog = output<void>();

  contact = input<Contact | null>(null);

  onClose() {
    this.closeDialog.emit();

  }

  // Update-Methode
  async onSaveContact(contact: Contact) {
    const originalContact = this.contact();

    if (!originalContact) return;

    contact.id = originalContact.id;

    await this.contactsService.updateContact(contact);
    await this.contactsService.getAllContacts();

    this.onClose();
  }

  // Delete-Methode im Edit-Dialog
  async onDeleteContact() {
  const contact = this.contact();
  if (!contact) return;

  try {
    await this.contactsService.deleteContact(contact.id);
    await this.contactsService.getAllContacts();
    this.onClose();
  } catch (error) {
    console.error('Error deleting contact:', error);
  }
}


}
