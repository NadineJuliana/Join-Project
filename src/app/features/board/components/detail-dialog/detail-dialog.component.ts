import { Component, input, output } from '@angular/core';
import { CapitalizePipe } from '../../../../shared/pipes/capitalize.pipe';
import { Task } from '../../../tasks/models/task.model';

@Component({
  selector: 'app-detail-dialog',
  imports: [CapitalizePipe],
  templateUrl: './detail-dialog.component.html',
  styleUrl: './detail-dialog.component.scss',
})
export class DetailDialogComponent {
  task = input.required<Task>(); // Eingabe von Parent - die Komponente wird Task von außen erhalten
  closeDialog = output<void>();

  onClose() {
    this.closeDialog.emit(); // Sendet das Signal an die Parent
  }
}
