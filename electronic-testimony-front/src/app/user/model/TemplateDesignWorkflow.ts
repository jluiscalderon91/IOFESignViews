import {Stamplegend} from './Stamplegend';
import {Stampimage} from './Stampimage';
import {Stampqrcode} from './Stampqrcode';
import {Stamptestfile} from './Stamptestfile';
import {Stampdatetime} from './Stampdatetime';
import {Stamplayoutfile} from './Stamplayoutfile';
import {Stamprubric} from './Stamprubric';

export class TemplateDesignWorkflow {
  id: number;
  workflowId: number;
  stamptestfile: Stamptestfile;
  stamplegends: Stamplegend[];
  stampimages: Stampimage[];
  stampqrcodes: Stampqrcode[];
  stampdatetimes: Stampdatetime[];
  stamplayoutfile: Stamplayoutfile;
  stamprubrics: Stamprubric[];
}
