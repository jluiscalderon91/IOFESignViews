import {Workflow} from '../../user/model/Workflow';
import {SignType} from './enum/SignType';
import {Constant} from './Constant';
import {LocalStorage} from './LocalStorage';
import {Document} from '../../user/model/Document';

export class DocumentUtil {

  // TODO Reassign entity class or create a new class
  public static extractOnlyNecesaryWorkflowsBy(workflows: Workflow[], signType: SignType) {
    switch (signType) {
      case SignType.One2One:
        return DocumentUtil.filterBy(workflows, Constant.ONE2ONE, Constant.STATICALLY);
      case SignType.Batch:
        return DocumentUtil.filterBy(workflows, Constant.BATCH, Constant.STATICALLY);
      case SignType.Dynamic:
        return DocumentUtil.filterBy(workflows, Constant.ONE2ONE, Constant.DYNAMICALLY);
    }
  }

  private static filterBy(workflows: Workflow[], isBatch: number, isDynamic: number) {
    return workflows.filter(workflow => isBatch === workflow.batch && workflow.completed === Constant.COMPLETED && isDynamic === workflow.dynamic);
  }

  public static buildUrlDownload(document: any): string {
    return Constant.ROOT_API_V1
      .concat('/public/people/')
      .concat(String(LocalStorage.getPersonId()))
      .concat('/documents/')
      .concat(document.id)
      .concat('/')
      .concat(document.hashIdentifier)
      .concat('/resources/1/stream');
  }

  public static buildUrlUpload(document: Document, personId: number): string {
    return Constant.ROOT_API_V1
      .concat('/public/people/')
      .concat(String(personId))
      .concat('/documents/')
      .concat(String(document.id))
      .concat('/')
      .concat(document.hashIdentifier)
      .concat('/resources/1/stream/')
      .concat(String(document._more.willBeClosedStamping))
      .concat('/closedStamping');
  }
}
