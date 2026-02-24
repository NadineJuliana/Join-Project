import { Component, inject, output } from '@angular/core';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { Contact } from '../../models/contact.model';
import { ContactsService } from '../../services/contacts.service';
import { ToastsService } from '../../../../core/services/toasts.service';

@Component({
  selector: 'app-contact-dialog',
  imports: [ContactFormComponent],
  templateUrl: './contact-dialog.component.html',
  styleUrl: './contact-dialog.component.scss',
})
export class ContactDialogComponent {
  private contactsService = inject(ContactsService);
  private toastService = inject(ToastsService);

  closeDialog = output<void>();

  onClose() {
    this.closeDialog.emit();
  }

  // speichert den Kontakt via Service, lädt die Liste neu und schließt
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
