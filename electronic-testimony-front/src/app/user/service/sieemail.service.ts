import {Injectable} from '@angular/core';
import {Constant} from '../../global/util/Constant';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Headers} from '../../global/util/Headers';
import {Sieemail} from '../model/Sieemail';

@Injectable({
  providedIn: 'root'
})
export class SieemailService {

  private url = Constant.ROOT_API_V1.concat('/sieemails');

  constructor(private http: HttpClient) {
  }

  public save(sieemail: Sieemail): Observable<any> {
    return this.http.post(this.url, JSON.stringify(sieemail), Headers.contentType);
  }

  public update(sieemail: Sieemail): Observable<any> {
    return this.http.put(this.url, JSON.stringify(sieemail), Headers.contentType);
  }

  public getBy(participantId: number) {
    const url = Constant.ROOT_API_V1
      .concat('/participants/')
      .concat(String(participantId))
      .concat('/sieemails');
    return this.http.get(url);
  }
}
