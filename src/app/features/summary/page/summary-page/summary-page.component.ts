import { Component, computed, inject } from '@angular/core';
import { TasksService } from '../../../tasks/services/tasks.service';

@Component({
  selector: 'app-summary-page',
  imports: [],
  templateUrl: './summary-page.component.html',
  styleUrl: './summary-page.component.scss',
})
export class SummaryPageComponent {
  tasksService = inject(TasksService);

  async ngOnInit() {
    this.tasksService.initRealtime();
    await this.tasksService.initialize();
  }

  toDoCount = computed(() => this.tasksService.toDoTasks().length);
  doneCount = computed(() => this.tasksService.doneTasks().length);
  urgentCount = computed(() => this.tasksService.urgentTasks().length);
  boardCount = computed(() => this.tasksService.tasks().length);
  inProgressCount = computed(() => this.tasksService.inProgressTasks().length);
  awaitFeedbackCount = computed(
    () => this.tasksService.awaitFeedbackTasks().length,
  );

  upcomingDeadline = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDate = this.tasksService
    .tasks()
    .filter((task) => task.status ! == 'done' && !!task.due_date)
    .map((task) => new Date(task.due_date))
    .filter((date) => !isNaN(date.getTime()) && date >= today)
    .sort((a, b) => a.getTime() - b.getTime())[0];

    return nextDate ?? null;
  });

  upcomingDeadlineLabel = computed(() => {
    const date = this.upcomingDeadline();
    if (!date) return 'No upcoming deadline';
    return new Intl.DateTimeFormat('de-DE', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  })
}
