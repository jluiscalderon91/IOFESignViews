import {Component} from '@angular/core';
import {InformType} from '../../../../global/util/enum/InformType';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PersonService} from '../../../service/person.service';
import {Person} from '../../../model/Person';

@Component({
  selector: 'app-delete-person',
  templateUrl: './delete-person.component.html',
  styleUrls: ['./delete-person.component.css']
})
export class DeletePersonComponent {
  public person: Person;
  public loading: boolean;

  constructor(private modalService: NgbModal,
              private personService: PersonService,
              private activeModal: NgbActiveModal) {
  }

  public yes() {
    this.loading = true;
    const personId = this.person.id;
    this.personService.delete(personId).subscribe(person => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  public no() {
    this.activeModal.close(DeletePersonComponent);
  }
}
