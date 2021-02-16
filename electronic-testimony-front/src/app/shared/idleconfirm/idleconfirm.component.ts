import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {IdleResponse} from '../../global/util/enum/IdleResponse';

@Component({
  selector: 'app-iddleconfirm',
  templateUrl: './idleconfirm.component.html',
  styleUrls: ['./idleconfirm.component.css']
})
export class IdleconfirmComponent {

  title: string;
  body: string;

  constructor(private activeModal: NgbActiveModal) {
  }

  public logout() {
    this.activeModal.close(IdleResponse.Logout);
  }

  public stay() {
    this.activeModal.close(IdleResponse.Stay);
  }
}
