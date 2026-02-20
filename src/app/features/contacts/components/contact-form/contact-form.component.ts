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
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
  });

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
