import {Component} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Enterprise} from '../../../model/Enterprise';
import {EnterpriseService} from '../../../service/enterprise.service';
import {InformType} from '../../../../global/util/enum/InformType';

@Component({
  selector: 'app-delete-enterprise',
  templateUrl: './delete-enterprise.component.html',
  styleUrls: ['./delete-enterprise.component.css']
})
export class DeleteEnterpriseComponent {
  public enterprise: Enterprise;
  public loading: boolean;

  constructor(private activeModal: NgbActiveModal,
              private enterpriseService: EnterpriseService) {
  }

  public yes() {
    this.loading = true;
    const enterpriseId = this.enterprise.id;
    this.enterpriseService.delete(enterpriseId).subscribe(enterprise => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });

  }

  public no() {
    this.activeModal.close(DeleteEnterpriseComponent);
  }
}
