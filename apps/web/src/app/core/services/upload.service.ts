import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  cdnUrl: string;
}

export interface UploadResult {
  key: string;
  url: string;
  cdnUrl?: string;
  filename: string;
  mimeType: string;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3000/api';

  getPresignedUrl(
    surveyId: string,
    filename: string,
    mimeType: string,
    size: number
  ): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(
      `${this.apiUrl}/uploads/presigned-url`,
      { surveyId, filename, mimeType, size }
    );
  }

  uploadToS3(presignedUrl: string, file: File): Observable<void> {
    return from(
      fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error('Upload failed');
        }
      })
    );
  }

  uploadFile(surveyId: string, file: File): Observable<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadResult>(
      `${this.apiUrl}/uploads/${surveyId}`,
      formData
    );
  }

  uploadWithPresignedUrl(
    surveyId: string,
    file: File
  ): Observable<{ key: string; cdnUrl: string }> {
    return this.getPresignedUrl(surveyId, file.name, file.type, file.size).pipe(
      switchMap((presigned) =>
        this.uploadToS3(presigned.uploadUrl, file).pipe(
          switchMap(() =>
            from(
              Promise.resolve({
                key: presigned.key,
                cdnUrl: presigned.cdnUrl,
              })
            )
          )
        )
      )
    );
  }

  deleteFile(key: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.apiUrl}/uploads/${encodeURIComponent(key)}`
    );
  }
}
