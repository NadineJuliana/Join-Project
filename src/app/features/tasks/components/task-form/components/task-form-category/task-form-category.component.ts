import { Component, HostListener, input, output, signal } from '@angular/core';

type TaskCategory = 'technical-task' | 'user-story';

@Component({
  selector: 'app-task-form-category',
  imports: [],
  templateUrl: './task-form-category.component.html',
  styleUrl: './task-form-category.component.scss',
})
export class TaskFormCategoryComponent {
  value = input<string>('');
  options = input.required<Array<{ value: TaskCategory; label: string }>>();
  placeholder = input('Select task category');
  invalid = input(false);

  valueChange = output<TaskCategory>();
  touched = output<void>();

  isDropdownOpen = signal(false);

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

  toggleDropdown(): void {
    if (this.isDropdownOpen()) {
      this.closeDropdown();
      return;
    }

    this.isDropdownOpen.set(true);
  }

  selectCategory(category: TaskCategory): void {
    this.valueChange.emit(category);
    this.touched.emit();
    this.closeDropdown();
  }

  isCategorySelected(category: TaskCategory): boolean {
    return this.value() === category;
  }

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

  private closeDropdown(): void {
    this.isDropdownOpen.set(false);
    this.touched.emit();
  }

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
