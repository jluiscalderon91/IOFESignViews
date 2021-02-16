import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Constant} from '../../global/util/Constant';
import {Headers} from '../../global/util/Headers';
import {StringUtil} from '../../global/util/StringUtil';
import {Observationcancel} from '../model/Observationcancel';
import {Revision} from '../components/document/review-document/review-document.component';
import {Contentdeliverymail} from '../model/Contentdeliverymail';
import {Document} from '../model/Document';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private url = Constant.ROOT_API_V1.concat('/documents');

  constructor(private http: HttpClient) {
  }

  public upload(formData: FormData): Observable<any> {
    return this.http.post(this.url, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  public uploadTo(url: string, formData: FormData): Observable<any> {
    return this.http.post(url, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  public reviewOne2One(url: string, formData: FormData): Observable<any> {
    return this.http.post(url, formData);
  }

  public get(url: string) {
    return this.http.get(url);
  }

  public cancel(observationcancel: Observationcancel): Observable<Response> {
    return this.http.put<any>(this.url, JSON.stringify(observationcancel), Headers.contentType);
  }

  public update(url: string, selectedDocuments: any[]): Observable<any> {
    const docIdentifiers = StringUtil.concatIdentifiers(selectedDocuments);
    const formData = new FormData();
    formData.append('docIdentifiers', docIdentifiers);
    return this.http.post(url, formData);
  }

  public getMultipleDocuments(url: string, formData: FormData): Observable<any> {
    return this.http.post(url, formData, {responseType: 'blob'});
  }

  public delete(document: any) {
    const url = this.url.concat('/').concat(String(document.id));
    return this.http.delete(url);
  }

  public getDocumentsOf(url: string): Observable<any> {
    return this.http.get(url, {responseType: 'blob'});
  }

  public postTraceability(url: string): Observable<Response> {
    return this.http.post<any>(url, new FormData());
  }

  public reviewBatch(url: string, revision: Revision): Observable<any> {
    return this.http.post(url, JSON.stringify(revision), Headers.contentType);
  }

  public send2Email(url: string, contentdeliverymail: Contentdeliverymail): Observable<any> {
    return this.http.post(url, JSON.stringify(contentdeliverymail), Headers.contentType);
  }

  public signElectronically(url: string, documents: Document[]): Observable<any> {
    const docIdentifiers = StringUtil.concatIdentifiers(documents);
    const formData = new FormData();
    formData.append('docIdentifiers', docIdentifiers);
    return this.http.post(url, formData);
  }
}
