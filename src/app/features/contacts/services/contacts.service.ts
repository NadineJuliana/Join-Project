import { computed, Injectable, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  constructor(private supabaseService: SupabaseService) {
    this.initRealtime();
  }
  contactsLoaded = false;

  contactsChannel: any;

  contacts = signal<Contact[]>([]);
  selectedContact = signal<Contact | null>(null);
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

  initRealtime() {
    this.contactsChannel = this.supabaseService
      .getSupabaseClient()
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Contacts' },
        (payload) => {
          this.handleRealtimeEvent(payload);
          console.log('Change received!', payload);
        },
      )
      .subscribe();
  }

  handleRealtimeEvent(payload: any) {
    switch (payload.eventType) {
      case 'INSERT':
        this.handleInsert(payload.new);
        break;
      case 'UPDATE':
        this.handleUpdate(payload.new);
        break;
      case 'DELETE':
        this.handleDelete(payload.old);
        break;
    }
  }

  handleInsert(newData: any) {
    const newContact = new Contact(newData);
    this.contacts.update((list) => [...list, newContact]);
  }

  handleUpdate(updatedData: any) {
    const updatedContact = new Contact(updatedData);
    this.contacts.update((list) =>
      list.map((c) => (c.id === updatedContact.id ? updatedContact : c)),
    );

    if (this.selectedContact()?.id === updatedContact.id) {
      this.selectedContact.set(updatedContact);
    }
  }

  handleDelete(oldData: any) {
    const deletedId = oldData.id;
    this.contacts.update((list) => list.filter((c) => c.id !== deletedId));

    if (this.selectedContact()?.id === deletedId) {
      this.selectedContact.set(null);
    }
  }

  ngOnDestroy() {
    if (this.contactsChannel) {
      this.supabaseService
        .getSupabaseClient()
        .removeChannel(this.contactsChannel);
    }
  }

  async getAllContacts() {
    let { data: contacts, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Contacts')
      .select('*');
    if (!contacts) {
      console.error('Error fetching contacts:', error);
      return;
    }
    console.log('Init get All Contacts', contacts);
    this.contacts.set((contacts || []).map((c) => new Contact(c)));
    this.contactsLoaded = true;
  }

  async addContact(contact: Contact) {
    const contact_data = contact.getCleanAddJson();
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Contacts')
      .insert(contact_data)
      .select();

    if (error) throw error;
    const newContact = new Contact(data[0]);
    this.contacts.update((contacts) => [...contacts, newContact]);
    return newContact;
  }

  async updateContact(contact: Contact) {
    const contact_data = contact.getCleanAddJson();
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Contacts')
      .update(contact_data)
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

  selectContact(contact: Contact | null) {
    this.selectedContact.set(contact);
  }

  clearSelectedContact() {
    this.selectedContact.set(null);
  }
}
