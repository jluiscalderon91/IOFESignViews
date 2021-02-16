import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Constant} from '../../global/util/Constant';
import {Enterprise} from '../model/Enterprise';
import {Observable} from 'rxjs';
import {Headers} from '../../global/util/Headers';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseService {

  private url = Constant.ROOT_API_V1.concat('/enterprises');

  constructor(private http: HttpClient) {
  }

  public get(url: string) {
    return this.http.get(url);
  }

  public save(url: string, enterprise: Enterprise): Observable<Response> {
    return this.http.post<any>(url, JSON.stringify(enterprise), Headers.contentType);
  }

  public edit(enterprise: Enterprise): Observable<any> {
    return this.http.put(this.url, JSON.stringify(enterprise), Headers.contentType);
  }

  public delete(enterpriseId: number) {
    const url = this.url.concat('/', String(enterpriseId));
    return this.http.delete(url);
  }
}
