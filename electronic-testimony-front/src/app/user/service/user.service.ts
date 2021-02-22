import { Injectable } from '@angular/core';
import {Constant} from '../../global/util/Constant';
import {HttpClient} from '@angular/common/http';
import {User} from '../model/User';
import {Observable} from 'rxjs';
import {Headers} from '../../global/util/Headers';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url = Constant.ROOT_API_V1.concat('/users');

  constructor(private http: HttpClient) { }

  public get(url: string) {
    return this.http.get(url);
  }

  public save(user: User): Observable<Response> {
    return this.http.post<any>(this.url, JSON.stringify(user), Headers.contentType);
  }

  public edit(user: User): Observable<any> {
    return this.http.put(this.url, JSON.stringify(user), Headers.contentType);
  }

  public delete(user: User) {
    const url = this.url.concat('/').concat(String(user.id));
    return this.http.delete(url);
  }
}
