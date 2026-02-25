import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
})
export class EllipsisPipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 40): string {
    if (!value) {
      return '';
    }
    return value.length > limit ? value.slice(0, limit) + '...' : value;
  }
}
