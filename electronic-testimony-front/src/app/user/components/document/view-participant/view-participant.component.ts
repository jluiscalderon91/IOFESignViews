import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Constant} from '../../../../global/util/Constant';
import {Person} from '../../../model/Person';

@Component({
  selector: 'app-view-participant',
  templateUrl: './view-participant.component.html',
  styleUrls: ['./view-participant.component.css']
})
export class ViewParticipantComponent implements OnInit {

  public peopleReceived: Person[];

  constructor(private activeModal: NgbActiveModal) {
  }

  ngOnInit() {
  }

  cancel() {
    this.activeModal.close(ViewParticipantComponent);
  }

  public getOperationDescription(person: any): string {
    if (person._more) {
      return person._more.operationDescription;
    }
  }

  public isSigner(person: any) {
    if (person._more) {
      return Constant.SIGN_OPTION === person._more.operationId;
    }
  }
}
