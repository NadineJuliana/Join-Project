import { Component } from '@angular/core';

@Component({
  selector: 'app-task-form',
  imports: [],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent {
  todayMinDate = this.getTodayMinDate();

  private getTodayMinDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const monthNumber = now.getMonth() + 1;
    const dayNumber = now.getDate();
    const month = monthNumber < 10 ? `0${monthNumber}` : `${monthNumber}`;
    const day = dayNumber < 10 ? `0${dayNumber}` : `${dayNumber}`;
    return `${year}-${month}-${day}`;
  }
}
