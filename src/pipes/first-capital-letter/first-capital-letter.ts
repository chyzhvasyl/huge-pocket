import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the FirstCapitalLetterPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'firstCapitalLetter',
})
export class FirstCapitalLetterPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {
    return value.replace(value.charAt(0), value.charAt(0).toUpperCase());
  }
}
