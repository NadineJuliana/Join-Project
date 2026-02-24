import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Contact } from '../../models/contact.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [InitialsPipe],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss',
})
export class ContactDetailsComponent {
  @Input() contact: Contact | null = null;

  @Output() back = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
