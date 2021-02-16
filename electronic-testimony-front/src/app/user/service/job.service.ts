import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Constant} from '../../global/util/Constant';
import {Observable} from 'rxjs';
import {Headers} from '../../global/util/Headers';
import {Job} from '../model/Job';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  private url = Constant.ROOT_API_V1.concat('/jobs');

  constructor(private http: HttpClient) {
  }

  public get(url: string) {
    return this.http.get(url);
  }

  public save(job: Job): Observable<Response> {
    return this.http.post<any>(this.url, JSON.stringify(job), Headers.contentType);
  }

  public edit(job: Job): Observable<any> {
    return this.http.put(this.url, JSON.stringify(job), Headers.contentType);
  }

  public delete(job: Job) {
    const url = this.url.concat('/').concat(String(job.id));
    return this.http.delete(url);
  }
}
