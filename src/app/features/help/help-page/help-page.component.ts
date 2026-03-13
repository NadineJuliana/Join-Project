import { Component } from '@angular/core';
import { HELP_CONTENT } from '../components/help-content';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-page',
  imports: [],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss',
})
export class HelpPageComponent {
  content = HELP_CONTENT;

  constructor(
    private sanitizer: DomSanitizer,
    private location: Location,
    private router: Router,
  ) {}

  highlightJoin(text: string): SafeHtml {
    if (!text) return '';
    const html = text.replace(
      /Join/g,
      `<span class="join-highlight">Join</span>`,
    );
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/summary']);
    }
  }
}
