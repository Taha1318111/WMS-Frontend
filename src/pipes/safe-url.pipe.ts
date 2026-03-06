// pipes/safe-url.pipe.ts
import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string, type: 'url' | 'resourceUrl' = 'url'): SafeUrl | SafeResourceUrl {
    if (!url) {
      return '';
    }

    try {
      // First, validate URL
      new URL(url);
      
      // Then sanitize based on type
      if (type === 'resourceUrl') {
        return this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url) || 
               this.sanitizer.bypassSecurityTrustResourceUrl(url);
      } else {
        return this.sanitizer.sanitize(SecurityContext.URL, url) || 
               this.sanitizer.bypassSecurityTrustUrl(url);
      }
    } catch (e) {
      console.warn('Invalid URL:', url);
      return '';
    }
  }
}