import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

/**
 * Generated class for the SetVideoPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'setVideo',
})
export class SetVideoPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */

  constructor(private sanitizer: DomSanitizer) { }

    transform(style) {
        return this.sanitizer.bypassSecurityTrustHtml(style);
    }
  // constructor(private sanitizer: DomSanitizer) { }
  //
  //   transform(value) {
  //       // return this.sanitizer.bypassSecurityTrustUrl(this.sanitizer.bypassSecurityTrustResourceUrl(this.sanitizer.bypassSecurityTrustHtml(value).toString()));
  //       return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  // }
}
