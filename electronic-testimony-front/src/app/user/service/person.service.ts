import {Injectable} from '@angular/core';
import {Person} from '../model/Person';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Constant} from '../../global/util/Constant';
import {Headers} from '../../global/util/Headers';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private url = Constant.ROOT_API_V1.concat('/people');

  constructor(private http: HttpClient) {
  }

  public save(person: Person): Observable<any> {
    return this.http.post(this.url, JSON.stringify(person), Headers.contentType);
  }

  public saveWorkflows(person: Person): Observable<any> {
    const url = Constant.ROOT_API_V1
      .concat('/people/').concat(String(person.id))
      .concat('/workflows');
    return this.http.put(url, JSON.stringify(person), Headers.contentType);
  }

  public edit(person: Person): Observable<any> {
    return this.http.put(this.url, JSON.stringify(person), Headers.contentType);
  }

  public delete(personId: number): Observable<any> {
    const url = this.url.concat('/', String(personId));
    return this.http.delete(url);
  }

  public get(url: string) {
    return this.http.get(url);
  }

  public resetPassword(url: string) {
    return this.http.put(url, Headers.contentType);
  }

  public updateRubric(url: string, rubricFileBase64: string, rubricFilename: string): Observable<any> {
    const formData = new FormData();
    formData.append('rubricFileBase64', rubricFileBase64);
    formData.append('rubricFilename', rubricFilename);
    return this.http.post(url, formData);
  }
}

