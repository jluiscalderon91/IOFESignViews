import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Constant} from '../../global/util/Constant';
import {Observable} from 'rxjs';
import {Headers} from '../../global/util/Headers';
import {GroupParticipant} from '../model/GroupParticipant';
import {StringUtil} from '../../global/util/StringUtil';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {

  private url = Constant.ROOT_API_V1.concat('/participants');

  constructor(private http: HttpClient) {
  }

  public search(enterpriseId: number, participantType: number, fullName: string) {
    const url = Constant.ROOT_API_V1
      .concat('/enterprises/')
      .concat(String(enterpriseId))
      .concat('/participants/')
      .concat(String(participantType))
      .concat('/people')
      .concat('?findby=').concat(fullName);
    return this.http.get(url);
  }

  public getParticipants(workflowId: number) {
    const url = Constant.ROOT_API_V1.concat('/workflows/')
      .concat(String(workflowId))
      .concat('/participants')
      .concat('?onlyreplaceable=false');
    return this.http.get(url);
  }

  public saveGroup(groupParticipant: GroupParticipant): Observable<any> {
    return this.http.post(this.url, JSON.stringify(groupParticipant), Headers.contentType);
  }

  public editGroup(groupParticipant: GroupParticipant): Observable<any> {
    return this.http.put(this.url, JSON.stringify(groupParticipant), Headers.contentType);
  }

  public update(url: string, selectedDocuments: any[]): Observable<any> {
    const docIdentifiers = StringUtil.concatIdentifiers(selectedDocuments);
    const formData = new FormData();
    formData.append('docIdentifiers', docIdentifiers);
    return this.http.post(url, formData);
  }

  public update2(url: string, formData: FormData): Observable<any> {
    return this.http.put(url, formData);
  }
}
