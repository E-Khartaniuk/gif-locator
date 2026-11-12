import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FileDownload {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  download(url: string, fileName: string): Observable<void> {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = this.document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(objectUrl));
      }),
    );
  }
}
