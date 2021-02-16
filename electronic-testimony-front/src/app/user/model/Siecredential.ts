import {MoreAboutSiecredential} from './common/MoreAboutSiecredential';

export class Siecredential {
  id: number;
  enterpriseId: number;
  username: string;
  version: number;
  createAt: string;
  active: number;
  // tslint:disable-next-line:variable-name
  _more: MoreAboutSiecredential;
}
