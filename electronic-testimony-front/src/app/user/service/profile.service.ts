import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Headers} from '../../global/util/Headers';
import {Person} from '../model/Person';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http: HttpClient) {
  }

  public get(url: string) {
    return this.http.get(url);
  }

  public update(url: string, person: Person): Observable<any> {
    return this.http.put(url, JSON.stringify(person), Headers.contentType);
  }
}
