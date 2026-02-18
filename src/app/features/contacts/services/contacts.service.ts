import { Injectable, signal } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  constructor(private supabaseService: SupabaseService) {}

  contacts = signal<Contact[]>([]);

  async getAllContacts() {
    let { data: contacts, error } = await this.supabaseService
      .getSupabaseClient()
      .from('Contacts')
      .select('*');
    if (!contacts) {
      console.error('Error fetching contacts:', error);
      return null;
    }
    this.contacts.set((contacts || []).map((c) => new Contact(c)));
  }

  async addContact(contact: Contact) {
    const contact_data = contact.getCleanAddJson();
    const { data, error } = await this.supabaseService
      .getSupabaseClient()
      .from('contacts')
      .insert(contact_data)
      .select()

    if (error) throw error;
    return new Contact(data[0]);
  }
}
