import { Pipe, PipeTransform } from '@angular/core';

/**
 * @category Pipes
 * @description Returns the initials of a given name (first and last word).
 */
  @Pipe({
    name: 'initials',
  })
  export class InitialsPipe implements PipeTransform {
    /**
     * Transform a name into initials.
     * @param name Full name string
     * @returns Two-letter initials in uppercase
     */
      transform(name?: string | null): string {
        if (!name) return '';
        const initials = name
          .trim()
          .split(' ')
          .filter((i) => i.length > 0);
        const firstInitial = initials[0]?.charAt(0) ?? '';
        const lastInitial =
          initials.length > 1 ? initials[initials.length - 1].charAt(0) : '';
        return (firstInitial + lastInitial).toUpperCase();
      }
  }
