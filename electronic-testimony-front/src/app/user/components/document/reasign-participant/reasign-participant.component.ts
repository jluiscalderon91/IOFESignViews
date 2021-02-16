import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Constant} from '../../../../global/util/Constant';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Person} from '../../../model/Person';
import {StringUtil} from '../../../../global/util/StringUtil';
import {InformType} from '../../../../global/util/enum/InformType';
import {ParticipantService} from '../../../service/participant.service';
import {Document} from '../../../model/Document';

@Component({
  selector: 'app-reasign-participant',
  templateUrl: './reasign-participant.component.html',
  styleUrls: ['./reasign-participant.component.css']
})
export class ReasignParticipantComponent {

  public people: any[];
  public document: Document;
  public loading: boolean;

  constructor(private activeModal: NgbActiveModal,
              private participantService: ParticipantService) {
  }

  public cancel() {
    this.activeModal.close(ReasignParticipantComponent);
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

  public drop(event: CdkDragDrop<Person[]>) {
    if (event.item.data._more.operationCompleted === Constant.INCOMPLETE && event.currentIndex <= this.lastIndexOfSigned) {
      return;
    }
    moveItemInArray(this.people, event.previousIndex, event.currentIndex);
  }

  public disableElements(person: Person): boolean {
    return Constant.COMPLETED === person._more.operationCompleted;
  }

  get lastIndexOfSigned(): number {
    for (let index = 0; index < this.people.length; index++) {
      const person = this.people[index];
      if (person._more.operationCompleted === Constant.INCOMPLETE) {
        return index - 1;
      }
    }
    return -1;
  }

  public save() {
    this.loading = true;
    const reasignIdentifiers = this.getConcatParticipants();
    const formData = new FormData();
    formData.append('reasignIdentifiers', reasignIdentifiers);
    const url = Constant.ROOT_API_V1
      .concat('/documents/')
      .concat(String(this.document.id))
      .concat('/people');
    this.participantService.update2(url, formData).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  private getConcatParticipants(): string {
    let value = '';
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < this.people.length; index++) {
      const person = this.people[index];
      value += ''
        .concat(person.id)
        .concat(',')
        .concat(String(index + 1))
        .concat('|');
    }
    return StringUtil.removeLastCharacter(value);
  }
}
