import {Employee} from './Employee';
import {MoreAboutPerson} from './common/MoreAboutPerson';
import {Scope} from './Scope';

export class Person {
  id: number;
  partnerId: number;
  enterpriseId: number;
  enterpriseIdView: number;
  enterpriseName: string;
  type: number;
  documentType: number;
  documentNumber: string;
  firstname: string;
  lastname: string;
  fullname: string;
  createAt: string;
  cellphone: string;
  active: number | any;
  email: string;
  roles: string;
  workflows: string;
  scope: number;
  jobId: number;
  replaceable: number;
  replaced: number;
  observation: string;
  orderParticipant: number;
  employeesById: Array<Employee>;
  scopesById: Array<Scope>;
  password: string;
  oldPassword: string;
  repeatNewPassword: string;
  newPassword: string;
  rubricBase64Data: string;
  rubricFilename: string;
  // tslint:disable-next-line:variable-name
  _more: MoreAboutPerson;
}

