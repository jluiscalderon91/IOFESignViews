import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Headers} from '../../global/util/Headers';
import {Constant} from '../../global/util/Constant';
import {HttpClient} from '@angular/common/http';
import {Shoppingcard} from '../model/Shoppingcard';

@Injectable({
  providedIn: 'root'
})
export class BuyBalanceService {

  private url = Constant.ROOT_API_V1.concat('/shoppingbalances');

  constructor(private http: HttpClient) {
  }

  public save(shoppingcard: Shoppingcard): Observable<Response> {
    return this.http.post<any>(this.url, JSON.stringify(shoppingcard), Headers.contentType);
  }

  public get(url: string) {
    return this.http.get(url);
  }
}
