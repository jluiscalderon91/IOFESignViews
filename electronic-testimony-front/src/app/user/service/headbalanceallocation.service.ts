import { Injectable } from '@angular/core';
import {Job} from '../model/Job';
import {Observable} from 'rxjs';
import {Headers} from '../../global/util/Headers';
import {Constant} from '../../global/util/Constant';
import {Headbalanceallocation} from '../model/Headbalanceallocation';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HeadbalanceallocationService {

  private url = Constant.ROOT_API_V1.concat('/headbalanceallocations');

  constructor(private http: HttpClient) { }

  public save(headbalanceallocation: Headbalanceallocation): Observable<Response> {
    return this.http.post<any>(this.url, JSON.stringify(headbalanceallocation), Headers.contentType);
  }
}
