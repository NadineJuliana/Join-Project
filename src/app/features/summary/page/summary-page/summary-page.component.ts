import { Component, computed, inject } from '@angular/core';
import { TasksService } from '../../../tasks/services/tasks.service';

@Component({
  selector: 'app-summary-page',
  imports: [],
  templateUrl: './summary-page.component.html',
  styleUrl: './summary-page.component.scss'
})
export class SummaryPageComponent {
  tasksService = inject(TasksService);

  async ngOnInit(){
    this.tasksService.initRealtime();
    await this.tasksService.initialize();
  }

  toDoCount = computed(() => this.tasksService.toDoTasks().length);
  doneCount = computed(() => this.tasksService.doneTasks().length);
  urgentCount = computed(() => this.tasksService.urgentTasks().length);
  boardCount = computed(() => this.tasksService.tasks().length);
  inProgressCount = computed(() => this.tasksService.inProgressTasks().length);
  awaitFeedbackCount = computed(() => this.tasksService.awaitFeedbackTasks().length);
}
