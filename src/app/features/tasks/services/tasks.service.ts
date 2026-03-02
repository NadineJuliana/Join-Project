import { computed, Injectable, signal } from '@angular/core';
import { SupabaseRealtimeService } from '../../../core/services/supabase-realtime.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Task } from '../models/task.model';
import { Subtask } from '../models/subtask.model';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ContactsService } from '../../contacts/services/contacts.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  constructor(
    private supabaseService: SupabaseService,
    private realtimeService: SupabaseRealtimeService,
    private contactsService: ContactsService,
  ) {}

  tasksLoaded = false;
  initialized = false;

  tasks = signal<Task[]>([]);

  initRealtime() {
    if (this.initialized) return;
    this.initialized = true;
    this.createTaskChannel();
    this.createSubtaskChannel();
    this.createAssigneesChannel();
  }

  private createTaskChannel() {
    this.realtimeService.createChannel<Task>(
      'Tasks',
      'tasks-realtime-channel',
      (payload) => {
        this.handleTaskRealtimeEvent(payload);
      },
    );
  }

  private createSubtaskChannel() {
    this.realtimeService.createChannel<Subtask>(
      'Subtasks',
      'subtasks-realtime-channel',
      (payload) => {
        this.handleSubtaskRealtimeEvent(payload);
      },
    );
  }

  private createAssigneesChannel() {
    this.realtimeService.createChannel<{ task_id: number; contact_id: number }>(
      'Assignees',
      'assignees-realtime-channel',
      (payload) => {
        this.handleAssigneesRealtimeEvent(payload);
      },
    );
  }

  private handleTaskRealtimeEvent(
    payload: RealtimePostgresChangesPayload<Task>,
  ) {
    switch (payload.eventType) {
      case 'INSERT':
        this.handleInsertTask(payload.new);
        break;
      case 'UPDATE':
        this.handleUpdateTask(payload.new);
        break;
      case 'DELETE':
        if (payload.old) {
          this.handleDeleteTask(payload.old);
        }
        break;
    }
  }

  private handleInsertTask(newData: Partial<Task>) {
    const newTask = new Task(newData);
    this.tasks.update((list) => {
      const exists = list.some((t) => t.id === newTask.id);
      if (exists) {
        return list.map((t) => (t.id === newTask.id ? newTask : t));
      } else {
        return [...list, newTask];
      }
    });
  }

  private handleUpdateTask(updatedData: Partial<Task>) {
    const updatedTask = new Task(updatedData);
    this.tasks.update((list) =>
      list.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
  }

  private handleDeleteTask(oldData: Partial<Task>) {
    const deletedId = oldData.id;
    this.tasks.update((list) => list.filter((t) => t.id !== deletedId));
  }

  private handleSubtaskRealtimeEvent(
    payload: RealtimePostgresChangesPayload<Subtask>,
  ) {
    switch (payload.eventType) {
      case 'INSERT':
        if (payload.new) this.handleInsertSubtask(payload.new);
        break;
      case 'UPDATE':
        if (payload.new) this.handleUpdateSubtask(payload.new);
        break;
      case 'DELETE':
        if (payload.old) this.handleDeleteSubtask(payload.old);
        break;
    }
  }

  private handleInsertSubtask(newData: Partial<Subtask>) {
    const newSubtask = new Subtask(newData);
    const task = this.tasks().find((t) => t.id === newSubtask.task_id);
    if (!task) return;
    task.subtasks = [...(task.subtasks ?? []), newSubtask];
    this.updateTaskSignal(task);
  }

  private handleUpdateSubtask(updatedData: Partial<Subtask>) {
    const updatedSubtask = new Subtask(updatedData);
    const task = this.tasks().find((t) => t.id === updatedSubtask.task_id);
    if (!task || !task.subtasks) return;
    task.subtasks = task.subtasks.map((s) =>
      s.id === updatedSubtask.id ? updatedSubtask : s,
    );
    this.updateTaskSignal(task);
  }

  private handleDeleteSubtask(oldData: Partial<Subtask>) {
    const task = this.tasks().find((t) => t.id === oldData.task_id);
    if (!task || !task.subtasks) return;
    task.subtasks = task.subtasks.filter((s) => s.id !== oldData.id);
    this.updateTaskSignal(task);
  }

  private handleAssigneesRealtimeEvent(
    payload: RealtimePostgresChangesPayload<{
      task_id: number;
      contact_id: number;
    }>,
  ) {
    switch (payload.eventType) {
      case 'INSERT':
        if (payload.new?.task_id && payload.new?.contact_id)
          this.handleInsertAssignee({
            task_id: payload.new.task_id,
            contact_id: payload.new.contact_id,
          });
        break;
      case 'DELETE':
        if (payload.old?.task_id && payload.old?.contact_id)
          this.handleDeleteAssignee({
            task_id: payload.old.task_id,
            contact_id: payload.old.contact_id,
          });
        break;
    }
  }

  private handleInsertAssignee(data: { task_id: number; contact_id: number }) {
    const task = this.tasks().find((t) => t.id === data.task_id);
    if (!task) return;
    const contact = this.contactsService
      .contacts()
      .find((c) => c.id === data.contact_id);
    if (!contact) return;
    task.assignees = [...(task.assignees ?? []), contact];
    this.updateTaskSignal(task);
  }

  private handleDeleteAssignee(data: { task_id: number; contact_id: number }) {
    const task = this.tasks().find((t) => t.id === data.task_id);
    if (!task || !task.assignees) return;
    task.assignees = task.assignees.filter((c) => c.id !== data.contact_id);
    this.updateTaskSignal(task);
  }

  private updateTaskSignal(updatedTask: Task) {
    this.tasks.update((list) =>
      list.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
  }

  ngOnDestroy() {
    [
      'tasks-realtime-channel',
      'subtasks-realtime-channel',
      'assignees-realtime-channel',
    ].forEach((ch) => {
      this.realtimeService.removeChannel(ch);
    });
  }

}
