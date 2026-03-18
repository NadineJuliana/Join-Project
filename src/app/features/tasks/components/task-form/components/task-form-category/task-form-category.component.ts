import { Component, HostListener, input, output, signal } from '@angular/core';

type TaskCategory = 'technical-task' | 'user-story';

/**
 * @category Task Form Components
 * @description Custom dropdown component used to select a task category in the task form.
 * Handles category selection, dropdown state, and outside-click closing.
 */
  @Component({
    selector: 'app-task-form-category',
    imports: [],
    templateUrl: './task-form-category.component.html',
    styleUrl: './task-form-category.component.scss',
  })
  export class TaskFormCategoryComponent {
    /** Current selected category value */
      value = input<string>('');

    /** Available category options */
      options = input.required<Array<{ value: TaskCategory; label: string }>>();

    /** Placeholder text displayed when no category is selected */
      placeholder = input('Select task category');

    /** Flag indicating invalid form state */
      invalid = input(false);

    /** Emits when category value changes */
      valueChange = output<TaskCategory>();

    /** Emits when control is touched */
      touched = output<void>();

    /** Signal controlling dropdown open/close state */
      isDropdownOpen = signal(false);

    /** Close dropdown when clicking outside the component */
      @HostListener('document:click', ['$event'])
      onDocumentClick(event: MouseEvent): void {
        if (!this.isDropdownOpen()) {
          return;
        }
        const targetElement = this.getTargetElement(event.target);
        if (
          !targetElement ||
          targetElement.closest('.task-form-category') === null
        ) {
          this.closeDropdown();
        }
      }

    /** Toggle dropdown visibility */
      toggleDropdown(): void {
        if (this.isDropdownOpen()) {
          this.closeDropdown();
          return;
        }
        this.isDropdownOpen.set(true);
      }

    /** Select a task category */
      selectCategory(category: TaskCategory): void {
        this.valueChange.emit(category);
        this.touched.emit();
        this.closeDropdown();
      }

    /** Check if a category is currently selected */
      isCategorySelected(category: TaskCategory): boolean {
        return this.value() === category;
      }

    /** Get display label for selected category */
      getCategoryDisplayLabel(): string {
        const selectedCategory = this.value();
        if (!selectedCategory) {
          return this.placeholder();
        }
        return (
          this.options().find((option) => option.value === selectedCategory)
            ?.label ?? this.placeholder()
        );
      }

    /** Close dropdown menu */
      private closeDropdown(): void {
        this.isDropdownOpen.set(false);
        this.touched.emit();
      }

    /** Safely resolve event target element */
      private getTargetElement(target: EventTarget | null): Element | null {
        if (!target) {
          return null;
        }
        if (target instanceof Element) {
          return target;
        }
        if (target instanceof Node) {
          return target.parentElement;
        }
        return null;
      }
  }
