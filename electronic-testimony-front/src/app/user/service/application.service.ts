import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  private userLoggedIn = new Subject<boolean>();

  constructor(private http: HttpClient) {
    this.userLoggedIn.next(false);
  }

  public setUserLoggedIn(userLoggedIn: boolean) {
    this.userLoggedIn.next(userLoggedIn);
  }

  public getUserLoggedIn(): Observable<boolean> {
    return this.userLoggedIn.asObservable();
  }

  public get(url: string) {
    return this.http.get(url);
  }

  public post(url: string, formData: FormData): Observable<Response> {
    return this.http.post<any>(url, formData);
  }
}
