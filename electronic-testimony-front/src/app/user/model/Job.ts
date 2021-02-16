import {MoreAboutJob} from './common/MoreAboutJob';

export class Job {
  id: number;
  enterpriseId: number;
  description: string;
  createAt: string;
  active: number;
  // tslint:disable-next-line:variable-name
  _more: MoreAboutJob;
}
