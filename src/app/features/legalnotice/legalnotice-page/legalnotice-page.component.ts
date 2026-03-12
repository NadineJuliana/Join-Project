import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { LEGALNOTICE_CONTENT } from '../components/legalnotice-content';

@Component({
  selector: 'app-legalnotice-page',
  imports: [],
  templateUrl: './legalnotice-page.component.html',
  styleUrl: './legalnotice-page.component.scss',
})
export class LegalnoticePageComponent implements OnInit {
  isLoggedIn = false;
  content = LEGALNOTICE_CONTENT;

  constructor(
    private auth: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private location: Location,
  ) {}

  async ngOnInit() {
    this.isLoggedIn = await this.auth.isLoggedIn();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    }
  }

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

  goBack() {
    this.location.back();
  }
}
