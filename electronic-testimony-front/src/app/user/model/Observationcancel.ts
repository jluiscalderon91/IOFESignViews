import {MoreAboutObservationcancel} from './common/MoreAboutObservationcancel';

export class Observationcancel {
  id: number;
  documentId: number;
  personId: number;
  description: string;
  createAt: string;
  active: number;
  // tslint:disable-next-line:variable-name
  _more = new MoreAboutObservationcancel();
}
