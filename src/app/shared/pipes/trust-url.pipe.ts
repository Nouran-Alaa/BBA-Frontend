import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Bypasses Angular's DomSanitizer for trusted URLs used in iframes.
 * Usage: [src]="videoUrl | trustUrl"
 *
 * ⚠️  Only apply to URLs you control or have vetted — never to user input.
 */
@Pipe({
  name: 'trustUrl',
  standalone: true,
})
export class TrustUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
