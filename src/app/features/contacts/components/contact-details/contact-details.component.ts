import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Contact } from '../../models/contact.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';

/**
 * @category Contacts
 * @description Displays details of a single contact with actions (edit/delete/back).
 */
@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [InitialsPipe],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss',
})
export class ContactDetailsComponent {
  /** The contact to display */
  @Input() contact: Contact | null = null;

  /** Emitted when back button is clicked */
  @Output() back = new EventEmitter<void>();

  /** Emitted when edit action is triggered */
  @Output() edit = new EventEmitter<void>();

  /** Emitted when delete action is triggered */
  @Output() delete = new EventEmitter<void>();

  /** Flag to open/close actions menu */
  isActionsMenuOpen = false;

  /** Toggle the actions menu */
  toggleActionsMenu(): void {
    this.isActionsMenuOpen = !this.isActionsMenuOpen;
  }

  /** Close the actions menu */
  closeActionsMenu(): void {
    this.isActionsMenuOpen = false;
  }

  /** Trigger edit event and close menu */
  onEdit(): void {
    this.edit.emit();
    this.closeActionsMenu();
  }

  /** Trigger delete event and close menu */
  onDelete(): void {
    this.delete.emit();
    this.closeActionsMenu();
  }
}
