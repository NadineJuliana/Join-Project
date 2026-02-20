import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent {
  private formBuilder = inject(FormBuilder);

  createContact = output<Contact>();
  cancelForm = output<void>();

  form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZäöüÄÖÜß\s]+\s+[a-zA-ZäöüÄÖÜß\s]+$/)]], // Der Name muss Vorname und Nachname enthalten UND darf keine Nummern enthalten -> erledigt!
    email: ['', [Validators.required, Validators.email]], // Email muss einem validen Regex entsprechen -> erledigt!
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]+$/)]], // Phone darf nur aus Nummern bestehen (opt. “+”) -> erledigt!
  });

  // Prüft ob Form valide ist → wenn nicht: markAllAsTouched() zeigt Fehler
  // Wenn valide: createContact.emit(new Contact(form.getRawValue()))
  onCreate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.createContact.emit(new Contact(this.form.getRawValue()));
  }

  onCancel() {
    this.cancelForm.emit();
  }

}
