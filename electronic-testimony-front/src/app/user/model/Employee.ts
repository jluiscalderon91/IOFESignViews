import {Job} from './Job';
import {Person} from './Person';

export class Employee {
  id: number;
  jobId: number;
  personId: number;
  createAt: string;
  active: number;
  observation: string;
  jobByJobId: Job;
  personByPersonId: Person;

}
