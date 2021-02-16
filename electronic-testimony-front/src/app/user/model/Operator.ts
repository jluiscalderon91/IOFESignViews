import {Person} from './Person';
import {Operation} from './Operation';

export class Operator {
  id: number;
  personId: number;
  operationId: number;
  enterpriseId: number;
  orderOperation: number;
  uploadRubric: boolean;
  digitalSignature: boolean;
  createAt: string;
  active: number;
  deleted: number;
  observation: string;
  personByPersonId: Person;
  operationByOperationId: Operation;
  correctOperation: number;
  isOldSignature: number;
  typeElectronicSignature: number;
}
