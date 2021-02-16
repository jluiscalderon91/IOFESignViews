import {Document} from './Document';

export class Documentmodification {
  id: number;
  description: string;
  createAt: string;
  active: number;
  documentByDocumentIdOld: Document;
  documentByDocumentIdNew: Document;
}
