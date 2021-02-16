import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Response} from '../../global/util/enum/Response';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent {

  public title: string;
  public body: string;

  constructor(private activeModal: NgbActiveModal) {
  }

  public yes() {
    this.activeModal.close(Response.Yes);
  }

  public no() {
    this.activeModal.close(Response.No);
  }
}
