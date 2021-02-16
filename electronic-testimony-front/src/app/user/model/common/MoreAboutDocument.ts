import {Stampdatetime} from '../Stampdatetime';
import {Resource} from '../Resource';

export class MoreAboutDocument {
  fullnameNextSigner: string;
  personId: number;
  assignmentProgress: string;
  operationId: number;
  activeNotification: number;
  enabledNotification: number;
  resources: Resource [];
  stampDatetime: Stampdatetime;
  uploaderName: string;
  enterpriseName: string;
  enterpriseTradeName: string;
  workflowDescription: string;
  dynamicWorkflow: number;
  digitalSignature: boolean;
  uuid: string;
  willBeClosedStamping: boolean;
  hasRubricSettings: boolean;
}
