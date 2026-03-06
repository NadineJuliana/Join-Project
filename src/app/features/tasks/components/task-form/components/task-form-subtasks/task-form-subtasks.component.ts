import {
  Component,
  OnChanges,
  SimpleChanges,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { Subtask } from '../../../../models/subtask.model';

@Component({
  selector: 'app-task-form-subtasks',
  imports: [],
  templateUrl: './task-form-subtasks.component.html',
  styleUrl: './task-form-subtasks.component.scss',
})
export class TaskFormSubtasksComponent implements OnChanges {
  resetTrigger = input(0);
  subtasksChange = output<Subtask[]>();
  subtasksExisting = input<Subtask[]>();

  subtaskDraft = signal('');
  subtasks = signal<Subtask[]>([]);
  hasSubtaskDraft = computed(() => this.subtaskDraft().trim().length > 0);
  editingSubtaskIndex = signal<number | null>(null);
  editingSubtaskDraft = signal('');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subtasksExisting'] && changes['subtasksExisting'].currentValue) {
      this.subtasks.set([...changes['subtasksExisting'].currentValue]);
      this.emitSubtasks();
    }
    if (!changes['resetTrigger']) {
      return;
    }
    if (changes['resetTrigger'].firstChange) {
      return;
    }
    this.subtasks.set([]);
    this.resetSubtaskInput();
    this.finishSubtaskEdit();
    this.emitSubtasks();
  }

  onSubtaskInput(event: Event): void {
    this.subtaskDraft.set(this.getInputValue(event));
  }

  resetSubtaskInput(): void {
    this.subtaskDraft.set('');
  }

  saveSubtask(): void {
    const content = this.subtaskDraft().trim();
    if (!content) {
      return;
    }

    this.subtasks.update((currentSubtasks) => [
      ...currentSubtasks,
      new Subtask({ content, completed: false, task_id: 0 }),
    ]);
    this.resetSubtaskInput();
    this.emitSubtasks();
  }

  startSubtaskEdit(index: number): void {
    const subtask = this.subtasks()[index];
    if (!subtask) {
      return;
    }

    this.editingSubtaskIndex.set(index);
    this.editingSubtaskDraft.set(subtask.content);
  }

  onEditingSubtaskInput(event: Event): void {
    this.editingSubtaskDraft.set(this.getInputValue(event));
  }

  saveEditedSubtask(): void {
    const index = this.editingSubtaskIndex();
    if (index === null) {
      return;
    }

    const content = this.editingSubtaskDraft().trim();
    if (!content) {
      return;
    }

    this.subtasks.update((currentSubtasks) =>
      currentSubtasks.map((subtask, currentIndex) =>
        currentIndex === index ? new Subtask({ ...subtask, content }) : subtask,
      ),
    );

    this.finishSubtaskEdit();
    this.emitSubtasks();
  }

  deleteSubtask(index: number): void {
    this.subtasks.update((currentSubtasks) =>
      currentSubtasks.filter((_, currentIndex) => currentIndex !== index),
    );

    const currentEditingIndex = this.editingSubtaskIndex();
    if (currentEditingIndex === null) {
      this.emitSubtasks();
      return;
    }

    if (currentEditingIndex === index) {
      this.finishSubtaskEdit();
      this.emitSubtasks();
      return;
    }

    if (index < currentEditingIndex) {
      this.editingSubtaskIndex.set(currentEditingIndex - 1);
    }

    this.emitSubtasks();
  }

  deleteEditingSubtask(): void {
    const index = this.editingSubtaskIndex();
    if (index !== null) {
      this.deleteSubtask(index);
    }
  }

  private finishSubtaskEdit(): void {
    this.editingSubtaskIndex.set(null);
    this.editingSubtaskDraft.set('');
  }

  private emitSubtasks(): void {
    this.subtasksChange.emit(this.subtasks());
  }

  private getInputValue(event: Event): string {
    const target = event.target as HTMLInputElement | null;
    return target?.value ?? '';
  }
}
