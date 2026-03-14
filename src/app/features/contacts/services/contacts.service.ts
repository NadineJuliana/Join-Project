import { computed, Injectable, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Contact } from '../models/contact.model';
import { SupabaseRealtimeService } from '../../../core/services/supabase-realtime.service';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * @category Contact Management
 * @description Service to manage contacts with realtime updates.
 * Provides signals for all contacts, selected contact, and current user.
 */
@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  constructor(
    private supabaseService: SupabaseService,
    private realtimeService: SupabaseRealtimeService,
  ) {}
  /** Flag if contacts are loaded */
  contactsLoaded = false;

  /** Flag to prevent multiple realtime initializations */
  initialized = false;

  /** All contacts signal */
  contacts = signal<Contact[]>([]);

  /** Currently selected contact */
  selectedContact = signal<Contact | null>(null);

  /** Current user contact */
  currentUserContact = signal<Contact | null>(null);

  /** Contacts grouped alphabetically by first letter */
  groupedContacts = computed(() => {
    const sorted = [...this.contacts()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    const grouped: Record<string, Contact[]> = {};
    sorted.forEach((contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(contact);
    });
    return Object.keys(grouped)
      .sort()
      .map((letter) => ({ letter, contacts: grouped[letter] }));
  });

  /** Initialize realtime subscription */
  initRealtime() {
    if (this.initialized) return;
    this.initialized = true;
    this.realtimeService.createChannel<Contact>(
      'Contacts',
      'contacts-realtime-channel',
      (payload) => {
        this.handleRealtimeEvent(payload);
      },
    );
  }

  /** Handle realtime events for contacts */
  handleRealtimeEvent(payload: RealtimePostgresChangesPayload<Contact>) {
    switch (payload.eventType) {
      case 'INSERT':
        this.handleInsert(payload.new);
        break;
      case 'UPDATE':
        this.handleUpdate(payload.new);
        break;
      case 'DELETE':
        if (payload.old) {
          this.handleDelete(payload.old);
        }
        break;
    }
  }

  /** Insert a contact into the signal */
  handleInsert(newData: Partial<Contact>) {
    const newContact = new Contact(newData);
    this.contacts.update((list) => {
      const exists = list.some((c) => c.id === newContact.id);
      if (exists) {
        return list.map((c) => (c.id === newContact.id ? newContact : c));
      } else {
        return [...list, newContact];
      }
    });
  }

  /** Update a contact in the signal */
  handleUpdate(updatedData: Partial<Contact>) {
    const updatedContact = new Contact(updatedData);
    this.contacts.update((list) =>
      list.map((c) => (c.id === updatedContact.id ? updatedContact : c)),
    );

    if (this.selectedContact()?.id === updatedContact.id) {
      this.selectedContact.set(updatedContact);
    }
  }

  /** Remove a contact from the signal */
  handleDelete(oldData: Partial<Contact>) {
    const deletedId = oldData.id;
    this.contacts.update((list) => list.filter((c) => c.id !== deletedId));

    if (this.selectedContact()?.id === deletedId) {
      this.selectedContact.set(null);
    }
  }

  /** Remove realtime channel */
  ngOnDestroy() {
    this.realtimeService.removeChannel('contacts-realtime-channel');
  }

  /** Fetch all contacts from Supabase */
  async getAllContacts() {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Contacts')
      .select('*');
    if (error) {
      throw error;
    }
    this.contacts.set(
      (data || []).map((c: Partial<Contact>) => new Contact(c)),
    );
    this.contactsLoaded = true;
  }

  /** Add a new contact to Supabase */
  async addContact(contact: Contact) {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Contacts')
      .insert(contact.getCleanAddJson())
      .select();

    if (error) throw error;
    const newContact = new Contact(data[0]);
    this.contacts.update((contacts) => [...contacts, newContact]);
    return newContact;
  }

  /** Update a contact in Supabase */
  async updateContact(contact: Contact) {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Contacts')
      .update(contact.getCleanAddJson())
      .eq('id', contact.id)
      .select();
    if (error) throw error;
    const updatedContact = new Contact(data[0]);
    this.contacts.update((list) =>
      list.map((c) => (c.id === updatedContact.id ? updatedContact : c)),
    );
    if (this.selectedContact()?.id === updatedContact.id) {
      this.selectedContact.set(updatedContact);
    }
    return updatedContact;
  }

  /** Delete a contact in Supabase */
  async deleteContact(id: number) {
    const { error } = await this.supabaseService
      .getSupabaseClient()
      .from('Contacts')
      .delete()
      .eq('id', id);
    if (error) throw error;
    this.contacts.update((list) => list.filter((c) => c.id !== id));

    if (this.selectedContact()?.id === id) {
      this.selectedContact.set(null);
    }
  }

  /** Set selected contact */
  selectContact(contact: Contact | null) {
    this.selectedContact.set(contact);
  }

  /** Clear selected contact */
  clearSelectedContact() {
    this.selectedContact.set(null);
  }

  /** Load current user contact by email */
  async loadCurrentUserContact(email: string) {
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Contacts')
      .select('*')
      .eq('email', email)
      .single();
    if (error) throw error;
    const contact = new Contact(data);
    this.currentUserContact.set(contact);
  }
}
