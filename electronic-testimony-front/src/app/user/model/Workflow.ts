import {MoreAboutWorkflow} from './common/MoreAboutWorkflow';

export class Workflow {
  id: number;
  enterpriseId: number;
  description: string;
  batch: number;
  maxParticipants: number;
  completed: number;
  ready2Use: number;
  deliver: number;
  code: string;
  type: number;
  dynamic: number;
  createAt: string;
  active: number;
  // tslint:disable-next-line:variable-name
  _more: MoreAboutWorkflow;
}
