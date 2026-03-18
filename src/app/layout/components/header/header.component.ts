import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ContactsService } from '../../../features/contacts/services/contacts.service';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';

/**
 * @category Layout
 * @description Header component displaying profile menu, user info, and logout functionality.
 */
  @Component({
    standalone: true,
    selector: 'app-header',
    imports: [RouterLink, InitialsPipe],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
  })
  export class HeaderComponent implements OnInit {
    /** Injected ContactsService */
      private contactsService = inject(ContactsService);

    /** Injected AuthService */
      private authService = inject(AuthService);

    /** Injected Router */
      private router = inject(Router);

    /** Flag if profile menu is open */
      isProfileMenuOpen = false;

    /** Flag if user is logged in */
      isLoggedIn = false;

    /** Reference to profile area for click outside detection */
      @ViewChild('profileArea') profileArea!: ElementRef;

    /** Initialize component and check login status */
      async ngOnInit() {
        this.isLoggedIn = await this.authService.isLoggedIn();
      }

    /** Toggle the profile menu open/close state */
      toggleProfileMenu(): void {
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
      }

    /** Close profile menu when clicking outside */
      @HostListener('document:click', ['$event.target'])
      onClickOutside(target: EventTarget | null) {
        if (
          this.isProfileMenuOpen &&
          target instanceof HTMLElement &&
          !this.profileArea.nativeElement.contains(target)
        ) {
          this.isProfileMenuOpen = false;
        }
      }

    /** Logout current user and navigate to login page */
      async logout() {
        await this.authService.logout();
        this.router.navigate(['/login']);
      }

    /** Get current user's name */
      get currentUser() {
        return this.contactsService.currentUserContact()?.name;
      }

    /** Check if current session is a guest */
      get isGuest() {
        return !!localStorage.getItem('guest');
      }
  }
