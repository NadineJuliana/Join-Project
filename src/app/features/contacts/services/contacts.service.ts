import { computed, Injectable, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  constructor(private supabaseService: SupabaseService) {}

  // contactListInsertChannel;
  // contactListDeleteChannel;

  contacts = signal<Contact[]>([]);
  selectedContact = signal<Contact | null>(null);
  groupedContacts = computed(() => {
    const sorted = [...this.contacts()].sort((a, b) => a.name.localeCompare(b.name));
    const grouped: Record<string, Contact[]> = {};
    sorted.forEach((contact) => {
      const letter = contact.name.charAt(0).toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(contact);
    });
    return Object.keys(grouped).sort().map((letter) => ({ letter, contacts: grouped[letter] }));
  });

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
  }

  async addContact(contact: Contact) {
    const contact_data = contact.getCleanAddJson();
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Contacts')
      .insert(contact_data)
      .select();

    if (error) throw error;
    return new Contact(data[0]);
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
    return new Contact(data[0]);
  }

  async deleteContact(id: number) {
    const { error } = await this.supabaseService
      .getSupabaseClient()
      .from('Contacts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  selectContact(contact: Contact | null) {
    this.selectedContact.set(contact);
  }
}
