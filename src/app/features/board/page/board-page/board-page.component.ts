import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TasksService } from '../../../tasks/services/tasks.service';
import { ContactsService } from '../../../contacts/services/contacts.service';
import { Task } from '../../../tasks/models/task.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { EllipsisPipe } from '../../../../shared/pipes/ellipsis.pipe';

// Interface - Definiert die Struktur einer Spalte
export interface BoardColumn {
  id: string;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'app-board-page',
  imports: [CommonModule, DragDropModule, InitialsPipe, EllipsisPipe],
  templateUrl: './board-page.component.html',
  styleUrl: './board-page.component.scss',
})
export class BoardPageComponent {
  activeDropListId: string | null = null;
  dbContactService = inject(ContactsService);
  dbTaskService = inject(TasksService);

  async ngOnInit() {
    await this.dbContactService.getAllContacts();
    await this.dbTaskService.initialize();
    this.dbContactService.initRealtime();
    this.dbTaskService.initRealtime();
  }

  get boardColumns(): BoardColumn[] {
    return [
      { id: 'to-do', title: 'To Do', tasks: this.dbTaskService.toDoTasks() },
      {
        id: 'in-progress',
        title: 'In Progress',
        tasks: this.dbTaskService.inProgressTasks(),
      },
      {
        id: 'await-feedback',
        title: 'Await Feedback',
        tasks: this.dbTaskService.awaitFeedbackTasks(),
      },
      { id: 'done', title: 'Done', tasks: this.dbTaskService.doneTasks() },
    ];
  }

  // - Die Drop-Handler Methode
  drop(event: CdkDragDrop<Task[]>) {
    // event.previousContainer = die Spalte, VON der die Task kommt
    // event.container = die Spalte, IN die die Task geht

    // - Wenn die Task in die gleiche Spalte geht
    if (event.previousContainer === event.container) {
      // Nur die Reihenfolge ändern (z.B. Task nach oben/unten verschieben)
      const items = event.container.data;
      const item = items[event.previousIndex];
      items.splice(event.previousIndex, 1);
      items.splice(event.currentIndex, 0, item);
    }
    // - Wenn die Task in eine andere Spalte geht
    else {
      // Task aus alter Spalte entfernen
      const item = event.previousContainer.data[event.previousIndex];
      event.previousContainer.data.splice(event.previousIndex, 1);

      // Task in neue Spalte einfügen
      event.container.data.splice(event.currentIndex, 0, item);
    }

    // Border nach dem Drop ausblenden
    this.activeDropListId = null;
  }

  // Wird aufgerufen, wenn eine Task über eine Spalte hovest
  onDropListEntered(columnId: string): void {
    this.activeDropListId = columnId;
  }

  // Wird aufgerufen, wenn eine Task die Spalte verlässt
  onDropListExited(columnId: string): void {
    this.activeDropListId = null;
  }
}
