import { Component, output} from '@angular/core';

@Component({
  selector: 'app-detail-dialog',
  imports: [],
  templateUrl: './detail-dialog.component.html',
  styleUrl: './detail-dialog.component.scss'
})
export class DetailDialogComponent {
  closeDialog = output<void>();

  onClose() {
    this.closeDialog.emit(); // Sendet das Signal an die Parent
  }
}
