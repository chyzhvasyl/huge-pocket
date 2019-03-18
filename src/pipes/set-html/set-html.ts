import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the SetHtmlPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'setHtml',
})
export class SetHtmlPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {
    return value.toLowerCase();
  }
}
