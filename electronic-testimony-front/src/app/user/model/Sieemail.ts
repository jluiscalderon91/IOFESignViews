import {Sierecipient} from './Sierecipient';

export class Sieemail {
  id: number;
  participantId: number;
  subject: string;
  body: string;
  sierecipientsById: Sierecipient[];
  createAt: string;
  active: number;
}
