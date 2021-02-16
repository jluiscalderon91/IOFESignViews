import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Headers} from '../../global/util/Headers';
import {Constant} from '../../global/util/Constant';
import {Workflow} from '../model/Workflow';
import {TemplateDesignWorkflow} from '../model/TemplateDesignWorkflow';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {

  private url = Constant.ROOT_API_V1.concat('/workflows');

  constructor(private http: HttpClient) {
  }

  public get(url: string) {
    return this.http.get(url);
  }

  public save(workflow: Workflow): Observable<any> {
    return this.http.post(this.url, JSON.stringify(workflow), Headers.contentType);
  }

  public edit(workflow: Workflow): Observable<any> {
    return this.http.put(this.url, JSON.stringify(workflow), Headers.contentType);
  }

  public delete(workflowId: number): Observable<any> {
    const deleteUrl = this.url.concat('?workflowId=').concat(String(workflowId));
    return this.http.delete(deleteUrl);
  }

  public saveTemplateDesign(templateDesignWorkflow: TemplateDesignWorkflow): Observable<any> {
    const urlTemplateDesign = this.url.concat('/templatedesign');
    return this.http.post(urlTemplateDesign, JSON.stringify(templateDesignWorkflow), Headers.contentType);
  }

  public updateTemplateDesign(templateDesignWorkflow: TemplateDesignWorkflow): Observable<any> {
    const urlTemplateDesign = this.url.concat('/templatedesign');
    return this.http.put(urlTemplateDesign, JSON.stringify(templateDesignWorkflow), Headers.contentType);
  }

  public getTemplateDesignBy(workflowId: number): Observable<any> {
    const workflowUrl = this.url.concat('/').concat(String(workflowId)).concat('/templatedesign');
    return this.http.get(workflowUrl);
  }
}
