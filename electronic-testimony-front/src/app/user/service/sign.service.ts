import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Constant} from '../../global/util/Constant';

@Injectable({
  providedIn: 'root'
})
export class SignService {

  private url = Constant.ROOT_API_V1.concat('/public/signs/batch/uuid');

  constructor(private http: HttpClient) {
  }

  public getUUID(personId: number, identifiers: string): Observable<any> {
    const formData = new FormData();
    formData.append('personId', String(personId));
    formData.append('identifiers', identifiers);
    return this.http.post(this.url, formData);
  }
}
