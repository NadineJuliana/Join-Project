import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  isProfileMenuOpen = false;

  @ViewChild('profileArea') profileArea!: ElementRef;

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
}
