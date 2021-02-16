import {MoreAboutHistoricalbalanceallocation} from './MoreAboutHistoricalbalanceallocation';

export class Historicalbalanceallocation {
  id: number;
  headbalanceallocationId: number;
  personId: number;
  quantity: number;
  balance: number;
  isReturn: number;
  createAt: string;
  active: number;
  // tslint:disable-next-line:variable-name
  _more: MoreAboutHistoricalbalanceallocation;
}
