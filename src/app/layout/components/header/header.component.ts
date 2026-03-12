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

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [RouterLink, InitialsPipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  private contactsService = inject(ContactsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  isProfileMenuOpen = false;
  isLoggedIn = false;

  @ViewChild('profileArea') profileArea!: ElementRef;

  async ngOnInit() {
    this.isLoggedIn = await this.authService.isLoggedIn();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

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

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  get currentUser() {
    return this.contactsService.currentUserContact()?.name;
  }

  get isGuest() {
    return !!localStorage.getItem('guest');
  }
}
