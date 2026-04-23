
import { Pipe, PipeTransform } from '@angular/core';
import { uiTitleCase } from '../utils/formatters';

@Pipe({
  name: 'uiTitleCase',
  standalone: true
})
export class UiTitleCasePipe implements PipeTransform {
  transform(value: string | any): string {
    if (typeof value !== 'string') return value;
    return uiTitleCase(value);
  }
}
