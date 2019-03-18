import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

/**
 * Generated class for the SetHtmlPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'setHtmlForAdmin',
})
export class SetHtmlForAdminPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(style) {
        return this.sanitizer.bypassSecurityTrustHtml(style);
    }
}
