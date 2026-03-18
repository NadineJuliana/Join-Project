import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { LEGALNOTICE_CONTENT } from '../components/legalnotice-content';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';

/**
 * @category Pages
 * @description Legal notice page displaying company information and legal details.
 */
  @Component({
    selector: 'app-legalnotice-page',
    imports: [],
    templateUrl: './legalnotice-page.component.html',
    styleUrl: './legalnotice-page.component.scss',
  })
  export class LegalnoticePageComponent implements OnInit {
    /** Static legal notice content */
      content = LEGALNOTICE_CONTENT;

    /** Indicates whether the user is logged in */
      isLoggedIn = false;

    /** Authentication service.
     * Angular router.
     * HTML sanitizer.
     * Location service for browser navigation.
     */
      constructor(
        private authService: AuthService,
        private router: Router,
        private sanitizer: DomSanitizer,
        private location: Location,
      ) {}

    /** Initialize component and check login status */
      async ngOnInit() {
        this.isLoggedIn = await this.authService.isLoggedIn();
      }

    /**
     * Highlights specific keywords inside the legal notice text.
     * @param text Text to process
     * @returns Sanitized HTML with highlighted keywords
     */
      highlightJoin(text: string): SafeHtml {
        if (!text) return '';
        let html = text;
        html = text.replace(/Join/g, `<span class="join-highlight">Join</span>`);
        html = html.replace(
          /Developer Akademie GmbH/g,
          `<span class="developer-highlight">Developer Akademie GmbH</span>`,
        );
        return this.sanitizer.bypassSecurityTrustHtml(html);
      }

    /** Navigate back or fallback to summary page */
      goBack() {
        if (window.history.length > 1) {
          this.location.back();
        } else {
          this.router.navigate(['/summary']);
        }
      }
  }
