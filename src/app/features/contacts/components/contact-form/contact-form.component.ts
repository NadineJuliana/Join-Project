import { Component, inject, output, input, effect } from '@angular/core';
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

  saveContact = output<Contact>();
  cancelForm = output<void>();
  deleteContact = output<void>();

  form = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-ZäöüÄÖÜß\s]+\s+[a-zA-ZäöüÄÖÜß\s]+$/),
      ],
    ], // Der Name muss Vorname und Nachname enthalten UND darf keine Nummern enthalten -> erledigt!
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[a-z]{2,6}$/i),
      ],
    ], // Email muss einem validen Regex entsprechen -> erledigt!
    phone: ['', [Validators.required, Validators.pattern(/^[\d+\s]+$/)]], // Phone darf nur aus Nummern bestehen (opt. “+”) -> erledigt!
  });

  mode = input<'create' | 'edit'>('create');
  initialContact = input<Contact | null>(null);

  constructor() {
    effect(() => {
      const contact = this.initialContact();
      const currentMode = this.mode();

      if (currentMode === 'edit' && contact) {
        this.form.patchValue({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
        });
      }
    });
  }

  // Prüft ob Form valide ist → wenn nicht: markAllAsTouched() zeigt Fehler
  // Wenn valide: createContact.emit(new Contact(form.getRawValue()))
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saveContact.emit(new Contact(this.form.getRawValue()));
  }

  onCancel() {
    if (this.mode() === 'edit') {
      this.deleteContact.emit();
      return;
    }

    this.cancelForm.emit();
  }

  formatNameField() {
    const control = this.form.controls.name;
    control.setValue(new Contact({ name: control.value }).name, {
      emitEvent: false,
    });
  }

  formatPhoneField() {
    const control = this.form.controls.phone;
    control.setValue(new Contact({ phone: control.value }).phone, {
      emitEvent: false,
    });
  }
}
