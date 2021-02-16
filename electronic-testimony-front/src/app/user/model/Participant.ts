import {MoreAboutParticipant} from './common/MoreAboutParticipant';

export class Participant {
  id: number;
  workflowId: number;
  operationId: number;
  personId: number;
  participantType: number;
  orderParticipant: number;
  uploadRubric: boolean;
  digitalSignature: boolean;
  typeElectronicSignature: number;
  createAt: string;
  active: number;
  addTsa: number;
  addTsa1: number; // Propiedad usada solo de forma ---
  sendAlert: number;
  sendAlert1: number; // Propiedad usada solo de forma ---
  sendAlert2: number; // Propiedad usada solo de forma ---
  sendNotification: number;
  sendNotification1: number; // Propiedad usada solo de forma ---
  sendNotification2: number; // Propiedad usada solo de forma ---
  personFullName: string;
  observation: string;
  // tslint:disable-next-line:variable-name
  _more = new MoreAboutParticipant();
}
