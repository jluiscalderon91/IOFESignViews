import {Component} from '@angular/core';
import {Constant} from '../../../global/util/Constant';
import {ApplicationService} from '../../service/application.service';
import HttpStatusCode from '../../../global/util/HttpStatusCode';
import {InformType} from '../../../global/util/enum/InformType';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Dialog} from '../../../global/util/Dialog';

@Component({
  selector: 'app-global-config',
  templateUrl: './global-config.component.html',
  styleUrls: ['./global-config.component.css']
})
export class GlobalConfigComponent {

  public title = 'Configuraciones globales';
  public loading: boolean;

  constructor(private applicationService: ApplicationService,
              private modalService: NgbModal) {
    Dialog.createInstance(modalService);
  }

  public reload() {
    this.loading = true;
    const url = Constant.ROOT_API_V1.concat('/staticdata/reload');
    this.applicationService.get(url).subscribe(value => {
      this.loading = false;
      Dialog.show(InformType.Success, this.title);
    }, error => {
      this.loading = false;
      this.processError(this.title, error);
    });
  }

  private processError(title: string, error: any) {
    const status = error.status;
    if (status) {
      if (HttpStatusCode.UNAUTHORIZED === status) {
        Dialog.show(InformType.Danger, title, error.error.message);
      } else if (HttpStatusCode.FORBIDDEN === status) {
        Dialog.show(InformType.Info, 'Sesión expirada', 'Su sesión expiró y fue cerrada automáticamente. Por favor inicie sesión nuevamente.');
      } else {
        Dialog.show(InformType.Danger, title);
      }
    } else {
      Dialog.show(InformType.Danger, title, error.error.message);
    }
  }
}
