import { Pipe, PipeTransform } from '@angular/core';
import * as Convert from 'ansi-to-html';
import { DomSanitizer } from '@angular/platform-browser';

const convert = new Convert();

@Pipe({
  name: 'ansi',
  pure: false
})
export class AnsiHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(value: string) {
    return this.sanitizer.bypassSecurityTrustHtml(convert.toHtml(value));
  }
}
