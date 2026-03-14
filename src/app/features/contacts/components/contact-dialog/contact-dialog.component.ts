import { Component, inject, output } from '@angular/core';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { Contact } from '../../models/contact.model';
import { ContactsService } from '../../services/contacts.service';
import { ToastsService } from '../../../../core/services/toasts.service';

/**
 * @category Contacts
 * @description Dialog component used to create a new contact.
 * Uses ContactFormComponent and handles persistence and toast notifications.
 */
@Component({
  selector: 'app-contact-dialog',
  imports: [ContactFormComponent],
  templateUrl: './contact-dialog.component.html',
  styleUrl: './contact-dialog.component.scss',
})
export class ContactDialogComponent {
  /** Injected ContactsService for database operations */
  private contactsService = inject(ContactsService);

  /** Injected ToastsService for user notifications */
  private toastService = inject(ToastsService);

  /** Emits when the dialog should close */
  closeDialog = output<void>();

  /** Close the dialog */
  onClose() {
    this.closeDialog.emit();
  }

  /** Handle contact creation */
  async onCreateContact(contact: Contact) {
    await this.contactsService.addContact(contact);
    this.toastService.showToast({
      message: 'Contact successfully created',
      classname: 'toast__success',
      duration: 1000,
    });
    this.onClose();
  }
}
