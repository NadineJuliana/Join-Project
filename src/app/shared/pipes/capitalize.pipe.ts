import { Pipe, PipeTransform } from '@angular/core';

/**
 * @category Pipes
 * @description Capitalizes the first letter of each hyphen-separated word in a string.
 */
@Pipe({
  name: 'capitalize',
})
export class CapitalizePipe implements PipeTransform {
  /**
   * Capitalize hyphen-separated words.
   * @param value String to capitalize
   * @returns Capitalized string
   */
  transform(value: string | null): string {
    if (!value) return '';
    return value
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
  }
}
