import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ContactsService } from '../../contacts/services/contacts.service';
import { Contact } from '../../contacts/models/contact.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  landingIntroPlayed = false;

  constructor(
    private supabaseService: SupabaseService,
    private contactsService: ContactsService,
  ) {}

  private get client() {
    return this.supabaseService.getSupabaseClient();
  }

  async signUp(name: string, email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    const userEmail = data.user?.email;
    const contact = new Contact({ name, email: userEmail });
    await this.contactsService.addContact(contact);
    if (userEmail) {
      await this.contactsService.loadCurrentUserContact(userEmail);
    }
    return data;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    const userEmail = data.user?.email;
    if (userEmail) {
      await this.contactsService.loadCurrentUserContact(userEmail);
    }
    return data;
  }

  async loginAsGuest() {
    localStorage.setItem('guest', 'true');
    const { data, error } = await this.client.auth.signInWithPassword({
      email: 'guest@join-app.com',
      password: 'guest123456',
    });
    if (error) throw error;
    return data;
  }

  async logout() {
    await this.client.auth.signOut();
    localStorage.removeItem('guest');
    this.contactsService.clearSelectedContact();
    this.landingIntroPlayed = false;
  }

  async getUser() {
    const { data } = await this.client.auth.getUser();
    return data.user;
  }

  async isLoggedIn(): Promise<boolean> {
    const user = await this.getUser();
    const guestActive = !!localStorage.getItem('guest');
    return Boolean(user) || Boolean(guestActive);
  }
}
