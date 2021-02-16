import {Component, OnInit} from '@angular/core';
import {InformType} from '../../../../global/util/enum/InformType';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DocumentService} from '../../../service/document.service';
import {Observationcancel} from '../../../model/Observationcancel';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {ApplicationService} from '../../../service/application.service';
import {Router} from '@angular/router';
import {AuthService} from '../../../service/auth/auth.service';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-cancel-document',
  templateUrl: './cancel-document.component.html',
  styleUrls: ['./cancel-document.component.css']
})
export class CancelDocumentComponent implements OnInit {

  public document: any;
  public loading: boolean;
  public title = 'Anular documento';
  public body = '¿Esta seguro que desea anular el documento?';
  public observationcancel = new Observationcancel();

  constructor(private activeModal: NgbActiveModal,
              private documentService: DocumentService,
              private modalService: NgbModal,
              private router: Router,
              private applicationService: ApplicationService,
              private authenticationService: AuthService) {
    Dialog.createInstance(modalService);
  }

  ngOnInit(): void {
    const interval = setInterval(() => {
      if (!this.authenticationService.isAuthenticated()) {
        clearInterval(interval);
        this.activeModal.close(InformType.Anything);
      }
    }, 300);
  }

  public yes() {
    this.setValuesBefore2Save();
    this.loading = true;
    this.documentService.cancel(this.observationcancel).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.processError(error);
    });
  }

  public no() {
    this.activeModal.close();
  }

  private setValuesBefore2Save() {
    this.observationcancel.documentId = this.document.id;
  }

  private processError(error: any) {
    const status = error.status;
    if (status) {
      if (HttpStatusCode.UNAUTHORIZED === status) {
        Dialog.show(InformType.Danger, this.title, error.error.message);
      } else if (HttpStatusCode.FORBIDDEN === status) {
        Dialog.show(InformType.Info, 'Sesión expirada', 'Su sesión expiró y fue cerrada automáticamente. Por favor inicie sesión nuevamente.');
        this.logout();
      } else {
        Dialog.show(InformType.Danger, this.title);
      }
    } else {
      Dialog.show(InformType.Danger, this.title, error.error.message);
    }
  }

  private logout() {
    this.applicationService.setUserLoggedIn(false);
    this.router.navigate(['login']);
  }
}
