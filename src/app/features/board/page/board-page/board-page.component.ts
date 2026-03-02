import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-board-page',
  imports: [CommonModule, DragDropModule],
  templateUrl: './board-page.component.html',
  styleUrl: './board-page.component.scss',
})
export class BoardPageComponent {
  activeDropListId: string | null = null;
  boardColumns: BoardColumn[] = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: '1',
          title: 'Kochwelt Page & Recipe Recommender',
          description: 'Benutzer sollen sich anmelden können',
          priority: 'High',
          progress: 30,
          assignee: 'MP',
          category: 'User Story',
        },
        {
          id: '2',
          title: 'Datenbank Setup',
          description: 'PostgreSQL Datenbank einrichten',
          priority: 'Critical',
          progress: 0,
          assignee: 'AN',
          category: 'Technical Task',
        },
      ],
    },
    {
      id: 'inProgress',
      title: 'In Progress',
      tasks: [
        {
          id: '3',
          title: 'API Endpoints erstellen',
          description: 'REST API für Kontakte',
          priority: 'High',
          progress: 60,
          assignee: 'MP',
          category: 'User Story',
        },
      ],
    },
    {
      id: 'testing',
      title: 'Testing',
      tasks: [
        {
          id: '4',
          title: 'Unit Tests schreiben',
          description: 'Tests für Service Layer',
          priority: 'Medium',
          progress: 45,
          assignee: 'AN',
          category: 'User Story',
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        {
          id: '5',
          title: 'Navigation Menu',
          description: 'Hauptnavigation implementiert',
          priority: 'High',
          progress: 100,
          assignee: 'MP',
          category: 'Technical Task',
        }, 
      ],
    },
  ];

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

// Interface - Definiert die Struktur einer Task
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  progress: number;
  assignee: string;
  category: string;
}

// Interface - Definiert die Struktur einer Spalte
export interface BoardColumn {
  id: string;
  title: string;
  tasks: Task[];
}
