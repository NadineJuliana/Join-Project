import { Contact } from '../../contacts/models/contact.model';
import { Subtask } from './subtask.model';

export type TaskStatus = 'to-do' | 'in-progress' | 'await-feedback' | 'done';

export class Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'urgent';
  category: 'technical-task' | 'user-story';
  status: TaskStatus;
  position: number;
  subtasks?: Subtask[];
  assignees?: Contact[];

  constructor(data: Partial<Task>) {
    this.id = data.id ?? 0;
    this.title = data.title ?? '';
    this.description = data.description ?? '';
    this.due_date = data.due_date ?? '';
    this.priority = data.priority ?? 'medium';
    this.category = data.category ?? 'user-story';
    this.status = data.status ?? 'to-do';
    this.position = data.position ?? 0;
    this.subtasks = (data.subtasks ?? []).map((s) => new Subtask(s));
    this.assignees = data.assignees ?? [];
  }

  getCleanAddJson() {
    return {
      title: this.title,
      description: this.description,
      due_date: this.due_date,
      priority: this.priority,
      category: this.category,
      status: this.status,
      position: this.position,
    };
  }

  get subtaskProgress(): { percent: number; done: number; total: number } {
    const total = this.subtasks?.length ?? 0;
    if (total === 0) return { percent: 0, done: 0, total: 0 };
    const done = this.subtasks!.filter((s) => s.completed).length;
    const percent = Math.round((done / total) * 100);
    return { percent, done, total };
  }
}
