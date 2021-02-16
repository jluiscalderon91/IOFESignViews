import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Constant} from '../../global/util/Constant';
import {Observable} from 'rxjs';
import {Headers} from '../../global/util/Headers';
import {Role} from '../model/Role';
import {AuthoritiesList} from '../model/AuthoritiesList';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private url = Constant.ROOT_API_V1.concat('/roles');

  constructor(private http: HttpClient) {
  }

  public get(url: string) {
    return this.http.get(url);
  }

  public save(role: Role): Observable<Response> {
    return this.http.post<any>(this.url, JSON.stringify(role), Headers.contentType);
  }

  public edit(role: Role): Observable<any> {
    return this.http.put(this.url, JSON.stringify(role), Headers.contentType);
  }

  public delete(role: Role) {
    const url = this.url.concat('/').concat(String(role.id));
    return this.http.delete(url);
  }

  public saveAuthorities(url: string, authoritiesList: AuthoritiesList): Observable<any> {
    return this.http.put(url, JSON.stringify(authoritiesList), Headers.contentType);
  }
}
