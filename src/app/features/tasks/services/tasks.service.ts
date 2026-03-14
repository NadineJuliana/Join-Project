import { computed, Injectable, signal } from '@angular/core';
import { SupabaseRealtimeService } from '../../../core/services/supabase-realtime.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Task, TaskStatus } from '../models/task.model';
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
  toDoTasks = computed(() => this.tasks().filter((t) => t.status === 'to-do'));
  inProgressTasks = computed(() =>
    this.tasks().filter((t) => t.status === 'in-progress'),
  );
  awaitFeedbackTasks = computed(() =>
    this.tasks().filter((t) => t.status === 'await-feedback'),
  );
  doneTasks = computed(() => this.tasks().filter((t) => t.status === 'done'));
  urgentTasks = computed(() =>
    this.tasks().filter((t) => t.priority === 'urgent'),
  );

  async initialize() {
    await this.getAllTasks();
    await Promise.all([this.loadSubtasks(), this.loadAssignees()]);
    this.tasksLoaded = true;
  }

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

  handleInsertTask(newData: Partial<Task>) {
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

  handleInsertSubtask(newData: Partial<Subtask>) {
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

  handleInsertAssignee(data: { task_id: number; contact_id: number }) {
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

  updateTaskSignal(updatedTask: Task) {
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

  async getAllTasks() {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Tasks')
      .select('*')
      .order('position', { ascending: true });
    if (error) throw error;
    this.tasks.set((data || []).map((t) => new Task(t)));
    this.tasksLoaded = true;
  }

  async addTask(task: Task): Promise<Task> {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Tasks')
      .insert(task.getCleanAddJson())
      .select();
    if (error) throw error;
    return new Task(data[0]);
  }

  async updateTask(task: Task) {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Tasks')
      .update(task.getCleanAddJson())
      .eq('id', task.id)
      .select();
    if (error) throw error;
    this.handleUpdateTask(new Task(data[0]));
  }

  async deleteTask(taskId: number) {
    const { error } = await this.supabaseService
      .getSupabaseClient()
      .from('Tasks')
      .delete()
      .eq('id', taskId);
    if (error) throw error;
    this.handleDeleteTask({ id: taskId });
  }

  async moveTaskAndReorder(
    task: Task,
    columnTasks: Task[],
    newStatus: TaskStatus,
  ) {
    task.status = newStatus;
    columnTasks.forEach((t, index) => {
      t.position = index;
    });
    const updates = columnTasks.map((t) => ({
      id: t.id,
      status: t.status,
      position: t.position,
    }));
    await this.supabaseService
      .getSupabaseClient()
      .from('Tasks')
      .upsert(updates);
  }

  async loadSubtasks() {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Subtasks')
      .select('*');
    if (error) throw error;
    (data || []).forEach((subtaskData) => {
      this.handleInsertSubtask(subtaskData);
    });
  }

  async addSubtask(subtask: Subtask) {
    const { error } = await this.supabaseService
      .getSupabaseClient()
      .from('Subtasks')
      .insert(subtask.getCleanAddJson())
      .select();
    if (error) throw error;
  }

  async updateSubtask(subtask: Subtask) {
    const { error } = await this.supabaseService
      .getSupabaseClient()
      .from('Subtasks')
      .update(subtask.getCleanAddJson())
      .eq('id', subtask.id);
    if (error) throw error;
  }

  async deleteSubtask(id: number) {
    const { error } = await this.supabaseService
      .getSupabaseClient()
      .from('Subtasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async loadAssignees() {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Assignees')
      .select('*');
    if (error) throw error;
    (data || []).forEach((entry) => {
      this.handleInsertAssignee(entry);
    });
  }

  async addAssignee(taskId: number, contactId: number) {
    const { error } = await this.supabaseService
      .getSupabaseClient()
      .from('Assignees')
      .insert({
        task_id: taskId,
        contact_id: contactId,
      });
    if (error) throw error;
  }

  async removeAssignee(taskId: number, contactId: number) {
    const { error } = await this.supabaseService
      .getSupabaseClient()
      .from('Assignees')
      .delete()
      .match({
        task_id: taskId,
        contact_id: contactId,
      });
    if (error) throw error;
  }
}
