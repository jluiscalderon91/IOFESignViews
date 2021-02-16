import {MoreAboutEnterprise} from './common/MoreAboutEnterprise';

export class Enterprise {
  id: number;
  partnerId: number;
  documentType: string;
  documentNumber: string;
  name: string;
  tradeName: string;
  excluded: number;
  isPartner: number;
  createdByPersonId: number;
  createAt: string;
  active: boolean;
  deleted: boolean;
  observation: string;
  isCustomer: boolean;
  // tslint:disable-next-line:variable-name
  _more: MoreAboutEnterprise;
}
