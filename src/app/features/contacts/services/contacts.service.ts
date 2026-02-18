import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  constructor(private supabaseService: SupabaseService) {}

  async getContacts() {
    let { data: contacts, error } = await this.supabaseService.getSupabaseClient().from('Contacts').select('*');
    if (error) {
      console.error('Error fetching contacts:', error);
      return null;
    }
    return contacts;
  }
}
