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

/**
 * @category Task Form Components
 * @description Component for creating, editing, and managing subtasks within the task form.
 * Handles subtask creation, editing, deletion, and emits the updated subtask list to the parent component.
 */
  @Component({
    selector: 'app-task-form-subtasks',
    imports: [],
    templateUrl: './task-form-subtasks.component.html',
    styleUrl: './task-form-subtasks.component.scss',
  })
  export class TaskFormSubtasksComponent implements OnChanges {
    /** Trigger to reset all subtasks from the parent component */
      resetTrigger = input(0);

    /** Emits the updated list of subtasks to the parent component */
      subtasksChange = output<Subtask[]>();

    /** Existing subtasks passed from the parent component */
      subtasksExisting = input<Subtask[]>();

    /** Draft value for a new subtask */
      subtaskDraft = signal('');

    /** List of subtasks managed in this component */
      subtasks = signal<Subtask[]>([]);

    /** Indicates whether a subtask draft has content */
      hasSubtaskDraft = computed(() => this.subtaskDraft().trim().length > 0);

    /** Index of the subtask currently being edited */
      editingSubtaskIndex = signal<number | null>(null);

    /** Draft value while editing a subtask */
      editingSubtaskDraft = signal('');

    /** Reacts to changes in inputs such as existing subtasks or reset trigger */
      ngOnChanges(changes: SimpleChanges): void {
        if (
          changes['subtasksExisting'] &&
          changes['subtasksExisting'].currentValue
        ) {
          const incoming = changes['subtasksExisting'].currentValue;
          if (JSON.stringify(incoming) !== JSON.stringify(this.subtasks())) {
            this.subtasks.set([...incoming]);
          }
        }
        if (changes['resetTrigger'] && !changes['resetTrigger'].firstChange) {
          this.subtasks.set([]);
          this.resetSubtaskInput();
          this.finishSubtaskEdit();
        }
      }

    /** Update the subtask draft from input field */
      onSubtaskInput(event: Event): void {
        this.subtaskDraft.set(this.getInputValue(event));
      }

    /** Reset the subtask input field */
      resetSubtaskInput(): void {
        this.subtaskDraft.set('');
      }

    /** Save a new subtask to the list */
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

    /** Start editing an existing subtask */
      startSubtaskEdit(index: number): void {
        const subtask = this.subtasks()[index];
        if (!subtask) {
          return;
        }
        this.editingSubtaskIndex.set(index);
        this.editingSubtaskDraft.set(subtask.content);
      }

    /** Update draft value while editing a subtask */
      onEditingSubtaskInput(event: Event): void {
        this.editingSubtaskDraft.set(this.getInputValue(event));
      }

    /** Save changes made to an edited subtask */
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

    /** Delete a subtask from the list */
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

    /** Delete the currently edited subtask */
      deleteEditingSubtask(): void {
        const index = this.editingSubtaskIndex();
        if (index !== null) {
          this.deleteSubtask(index);
        }
      }

    /** Finish editing mode for a subtask */
      private finishSubtaskEdit(): void {
        this.editingSubtaskIndex.set(null);
        this.editingSubtaskDraft.set('');
      }

    /** Emit the updated subtask list to the parent component */
      private emitSubtasks(): void {
        this.subtasksChange.emit(this.subtasks());
      }

    /** Extract the value from an input event */
      private getInputValue(event: Event): string {
        const target = event.target as HTMLInputElement | null;
        return target?.value ?? '';
      }
  }
