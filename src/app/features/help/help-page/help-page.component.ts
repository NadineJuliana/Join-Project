import { Component } from '@angular/core';
import { HELP_CONTENT } from '../components/help-content';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

/**
 * @category Pages
 * @description Help page displaying help documentation and highlighting important keywords.
 */
@Component({
  selector: 'app-help-page',
  imports: [],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss',
})
export class HelpPageComponent {
  /** Static help page content */
  content = HELP_CONTENT;

  /** Angular sanitizer for safe HTML rendering.
   * Angular location service for navigation.
   * Router for fallback navigation. */
  constructor(
    private sanitizer: DomSanitizer,
    private location: Location,
    private router: Router,
  ) {}

  /**
   * Highlights the word "Join" inside a text string.
   * @param text Text to process
   * @returns Sanitized HTML with highlighted keyword
   */
  highlightJoin(text: string): SafeHtml {
    if (!text) return '';
    const html = text.replace(
      /Join/g,
      `<span class="join-highlight">Join</span>`,
    );
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /** Navigate back to previous page or fallback to summary */
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/summary']);
    }
  }
}
