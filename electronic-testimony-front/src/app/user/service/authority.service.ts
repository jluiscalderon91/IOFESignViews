import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Constant} from '../../global/util/Constant';
import {Observable} from 'rxjs';
import {Headers} from '../../global/util/Headers';
import {Authority} from '../model/Authority';

@Injectable({
  providedIn: 'root'
})
export class AuthorityService {

  private url = Constant.ROOT_API_V1.concat('/authorities');

  constructor(private http: HttpClient) {
  }

  public get(url: string) {
    return this.http.get(url);
  }

  public save(authority: Authority): Observable<Response> {
    return this.http.post<any>(this.url, JSON.stringify(authority), Headers.contentType);
  }

  public edit(authority: Authority): Observable<any> {
    return this.http.put(this.url, JSON.stringify(authority), Headers.contentType);
  }

  public delete(authority: Authority) {
    const url = this.url.concat('/', String(authority.id));
    return this.http.delete(url);
  }
}
