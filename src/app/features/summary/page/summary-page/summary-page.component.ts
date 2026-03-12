import { Component, computed, inject, OnDestroy } from '@angular/core';
import { TasksService } from '../../../tasks/services/tasks.service';
import { ContactsService } from '../../../contacts/services/contacts.service';

@Component({
  selector: 'app-summary-page',
  imports: [],
  templateUrl: './summary-page.component.html',
  styleUrl: './summary-page.component.scss',
})
export class SummaryPageComponent implements OnDestroy {
  tasksService = inject(TasksService);
  contactsService = inject(ContactsService);

  showMobileWelcomeIntro = false;
  private hideIntroTimeoutId?: ReturnType<typeof setTimeout>;
  private readonly mobileSummaryLoaderKey = 'showMobileSummaryLoader';
  private readonly introDurationMs = 900;

  async ngOnInit() {
    this.tasksService.initRealtime();
    this.startMobileIntro();
    await this.tasksService.initialize();
  }

  ngOnDestroy() {
    if (this.hideIntroTimeoutId) clearTimeout(this.hideIntroTimeoutId);
  }

  private startMobileIntro() {
    const shouldShow =
      this.isMobileViewport() &&
      sessionStorage.getItem(this.mobileSummaryLoaderKey) === '1';

    if (!shouldShow) return;

    this.showMobileWelcomeIntro = true;
    sessionStorage.removeItem(this.mobileSummaryLoaderKey);

    this.hideIntroTimeoutId = setTimeout(() => {
      this.showMobileWelcomeIntro = false;
    }, this.introDurationMs);
  }

  private isMobileViewport(): boolean {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  toDoCount = computed(() => this.tasksService.toDoTasks().length);
  doneCount = computed(() => this.tasksService.doneTasks().length);
  urgentCount = computed(() => this.tasksService.urgentTasks().length);
  boardCount = computed(() => this.tasksService.tasks().length);
  inProgressCount = computed(() => this.tasksService.inProgressTasks().length);
  awaitFeedbackCount = computed(
    () => this.tasksService.awaitFeedbackTasks().length,
  );

  private parseLocalDate(dateString: string): Date | null {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return isNaN(date.getTime()) ? null : date;
  }

  upcomingDeadline = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDate = this.tasksService
      .tasks()
      .filter((task) => task.status !== 'done' && !!task.due_date)
      .map((task) => this.parseLocalDate(task.due_date))
      .filter((date): date is Date => !!date && date >= today)
      .sort((a, b) => a.getTime() - b.getTime())[0];

    return nextDate ?? null;
  });

  upcomingDeadlineLabel = computed(() => {
    const date = this.upcomingDeadline();
    if (!date) return 'No upcoming deadline';
    return new Intl.DateTimeFormat('de-DE', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  });

  get isGuest() {
    return !!localStorage.getItem('guest');
  }

  get currentUserName() {
    return this.contactsService.currentUserContact()?.name;
  }

  get greetingByTime() {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 15) return 'Good afternoon';
    if (hour < 18) return 'Good day';
    return 'Good evening';
  }
}
