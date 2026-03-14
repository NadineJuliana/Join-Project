/**
 * @category Models
 * @description Model representing a subtask.
 */
export class Subtask {
  id: number;
  content: string;
  completed: boolean;
  task_id: number;

  /** Create a subtask instance from partial data */
  constructor(data: Partial<Subtask>) {
    this.id = data.id ?? 0;
    this.content = data.content ?? '';
    this.completed = data.completed ?? false;
    this.task_id = data.task_id ?? 0;
  }

  /** Return clean JSON for database insertion */
  getCleanAddJson() {
    return {
      content: this.content,
      completed: this.completed,
      task_id: this.task_id,
    };
  }
}
