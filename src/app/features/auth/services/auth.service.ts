import { Injectable } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { ContactsService } from '../../contacts/services/contacts.service';
import { Contact } from '../../contacts/models/contact.model';

/** Interface defining AuthResult */
  interface AuthResult {
    data?: { user: any; session: any };
    error?: { message: string };
  }

/**
 * @category Auth
 * @description Service to handle authentication, login, signup, logout, and guest sessions.
 */
  @Injectable({
    providedIn: 'root',
  })
  export class AuthService {
    /** Flag if landing intro has been played */
      landingIntroPlayed = false;

    /** Injected SupabaseService */
      constructor(
        private supabaseService: SupabaseService,
        private contactsService: ContactsService,
      ) {}

    /** Supabase client getter */
      private get client() {
        return this.supabaseService.getSupabaseClient();
      }

    /** Sign up a new user and create contact */
      async signUp(
        name: string,
        email: string,
        password: string,
      ): Promise<AuthResult> {
        try {
          const response = await this.client.auth.signUp({
            email,
            password,
          });
          if (response.error) {
            return { error: { message: response.error.message } };
          }
          const userEmail = response.data.user?.email;
          const contact = new Contact({ name, email: userEmail });
          await this.contactsService.addContact(contact);
          if (userEmail) {
            await this.contactsService.loadCurrentUserContact(userEmail);
          }
          return { data: response.data };
        } catch (err: unknown) {
          return { error: { message: 'Unknown error during signup' } };
        }
      }

    /** Login an existing user */
      async login(email: string, password: string): Promise<AuthResult> {
        try {
          const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            return { error: { message: error.message } };
          }
          const userEmail = data.user?.email;
          if (userEmail) {
            await this.contactsService.loadCurrentUserContact(userEmail);
          }
          return { data };
        } catch (err: unknown) {
          return { error: { message: 'Unknown error during login' } };
        }
      }

    /** Login as guest user */
      async loginAsGuest(): Promise<AuthResult> {
        try {
          localStorage.setItem('guest', 'true');
          const { data, error } = await this.client.auth.signInWithPassword({
            email: 'guest@join-app.com',
            password: 'guest123456',
          });
          if (error) {
            return { error: { message: error.message } };
          }
          return { data };
        } catch (err: unknown) {
          return { error: { message: 'Unknown error during guest login' } };
        }
      }

    /** Logout current user and reset state */
      async logout() {
        await this.client.auth.signOut();
        localStorage.removeItem('guest');
        this.contactsService.clearSelectedContact();
        this.landingIntroPlayed = false;
      }

    /** Get current Supabase user */
      async getUser() {
        const { data } = await this.client.auth.getUser();
        return data.user;
      }

    /** Check if a user or guest is logged in */
      async isLoggedIn(): Promise<boolean> {
        const { data } = await this.client.auth.getSession();
        const guestActive = !!localStorage.getItem('guest');
        return !!data.session || guestActive;
      }
  }
