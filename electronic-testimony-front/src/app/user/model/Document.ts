import {Person} from './Person';
import {MoreAboutDocument} from './common/MoreAboutDocument';

export class Document {
  id: number;
  type: number;
  subject: string;
  personId: number;
  personByPersonId: Person;
  finished: number;
  hashIdentifier: string;
  hasMultipleAttachments: number;
  closedStamping: boolean;
  stateId: number;
  reasonModification: string;
  createAt: string;
  active: number;
  // tslint:disable-next-line:variable-name
  _links: any;
  // tslint:disable-next-line:variable-name
  _more: MoreAboutDocument;
}
