import { Component, inject, output, input, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact } from '../../models/contact.model';

/**
 * @category Contacts
 * @description Reusable form component for creating and editing contacts.
 * Handles validation, formatting, and emits events for save, cancel, or delete actions.
 */
@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent {
  /** Injected FormBuilder for reactive form creation */
  private formBuilder = inject(FormBuilder);

  /** Emits when a contact should be saved */
  saveContact = output<Contact>();

  /** Emits when the form should be cancelled */
  cancelForm = output<void>();

  /** Emits when a contact should be deleted */
  deleteContact = output<void>();

  /** Reactive form for contact data */
  form = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-ZäöüÄÖÜß\s]+\s+[a-zA-ZäöüÄÖÜß\s]+$/),
        Validators.maxLength(40),
      ],
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[a-z]{2,6}$/i),
      ],
    ],
    phone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(\+|0)[0-9\s]*$/),
        Validators.maxLength(22),
      ],
    ],
  });

  /** Determines whether the form is in create or edit mode */
  mode = input<'create' | 'edit'>('create');

  /** Initial contact used to prefill the form in edit mode */
  initialContact = input<Contact | null>(null);

  /** Initialize form with contact values when editing */
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

  /** Handle form submission */
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saveContact.emit(new Contact(this.form.getRawValue()));
  }

  /** Handle cancel action */
  onCancel() {
    if (this.mode() === 'edit') {
      this.deleteContact.emit();
      return;
    }
    this.cancelForm.emit();
  }

  /** Format the name field using the Contact model logic */
  formatNameField() {
    const control = this.form.controls.name;
    control.setValue(new Contact({ name: control.value }).name, {
      emitEvent: false,
    });
  }

  /** Format the phone field using the Contact model logic */
  formatPhoneField() {
    const control = this.form.controls.phone;
    control.setValue(new Contact({ phone: control.value }).phone, {
      emitEvent: false,
    });
  }
}
