import { Pipe, PipeTransform } from '@angular/core';

/**
 * @category Pipes
 * @description Truncates a string and appends ellipsis if it exceeds a specified length.
 */
@Pipe({
  name: 'ellipsis',
})
export class EllipsisPipe implements PipeTransform {
  /**
   * Truncate text to a maximum length.
   * @param value String value to truncate
   * @param limit Maximum number of characters (default 60)
   * @returns Truncated string with "..." if exceeded
   */
  transform(value: string | null | undefined, limit: number = 60): string {
    if (!value) {
      return '';
    }
    return value.length > limit ? value.slice(0, limit) + '...' : value;
  }
}
