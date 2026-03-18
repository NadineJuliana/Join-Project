import { Component, computed, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TasksService } from '../../../tasks/services/tasks.service';
import { ContactsService } from '../../../contacts/services/contacts.service';

/**
 * @category Pages
 * @description Dashboard summary page displaying task statistics, greeting message,
 * and upcoming deadlines. Includes a mobile welcome intro animation.
 */
  @Component({
    standalone: true,
    selector: 'app-summary-page',
    imports: [RouterLink],
    templateUrl: './summary-page.component.html',
    styleUrl: './summary-page.component.scss',
  })
  export class SummaryPageComponent implements OnDestroy {
    /** Injected TasksService for accessing task data */
      tasksService = inject(TasksService);

    /** Injected ContactsService for accessing user contact data */
      contactsService = inject(ContactsService);

    /** Flag controlling mobile welcome intro visibility */
      showMobileWelcomeIntro = false;

    /** Timeout reference used to hide intro animation */
      private hideIntroTimeoutId?: ReturnType<typeof setTimeout>;

    /** SessionStorage key controlling mobile intro display */
      private readonly mobileSummaryLoaderKey = 'showMobileSummaryLoader';

    /** Duration of intro animation in milliseconds */
      private readonly introDurationMs = 900;

    /** Initialize realtime updates and start mobile intro if needed */
      async ngOnInit() {
        this.tasksService.initRealtime();
        this.startMobileIntro();
        await this.tasksService.initialize();
      }

    /** Clear running intro timeout on component destruction */
      ngOnDestroy() {
        if (this.hideIntroTimeoutId) clearTimeout(this.hideIntroTimeoutId);
      }

    /** Start mobile welcome intro animation if conditions are met */
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

    /** Check if current viewport matches mobile screen size */
      private isMobileViewport(): boolean {
        return window.matchMedia('(max-width: 768px)').matches;
      }

    /** Number of tasks in "To Do" status */
      toDoCount = computed(() => this.tasksService.toDoTasks().length);

    /** Number of completed tasks */
      doneCount = computed(() => this.tasksService.doneTasks().length);

    /** Number of urgent tasks */
      urgentCount = computed(() => this.tasksService.urgentTasks().length);

    /** Total number of tasks on the board */
      boardCount = computed(() => this.tasksService.tasks().length);

    /** Number of tasks currently in progress */
      inProgressCount = computed(() => this.tasksService.inProgressTasks().length);

    /** Number of tasks awaiting feedback */
      awaitFeedbackCount = computed(
        () => this.tasksService.awaitFeedbackTasks().length,
      );

    /** Parse a date string (YYYY-MM-DD) into a Date object */
      private parseLocalDate(dateString: string): Date | null {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return isNaN(date.getTime()) ? null : date;
      }

    /** Next upcoming task deadline */
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

    /** Human-readable label for the next deadline */
      upcomingDeadlineLabel = computed(() => {
        const date = this.upcomingDeadline();
        if (!date) return 'No upcoming deadline';
        return new Intl.DateTimeFormat('de-DE', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(date);
      });

    /** Check if current session is a guest */
      get isGuest() {
        return !!localStorage.getItem('guest');
      }

    /** Get the current user's name */
      get currentUserName() {
        return this.contactsService.currentUserContact()?.name;
      }

    /** Generate greeting message based on current time */
      get greetingByTime() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 15) return 'Good afternoon';
        if (hour < 18) return 'Good day';
        return 'Good evening';
      }
  }
