import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private http: HttpClient) {
  }

  public resend(documentUrl: string) {
    return this.http.post(documentUrl, new FormData());
  }
}

