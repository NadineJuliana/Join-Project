import { Contact } from '../../contacts/models/contact.model';
import { Subtask } from './subtask.model';

export class Task {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  category: 'technical-task' | 'user-story';
  status: 'to-do' | 'in-progress' | 'await-feedback' | 'done';
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
    };
  }
}
