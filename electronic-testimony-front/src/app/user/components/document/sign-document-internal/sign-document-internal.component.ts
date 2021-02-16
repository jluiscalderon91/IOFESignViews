import {Component, OnInit} from '@angular/core';
import {Resource} from '../../../model/Resource';
import {VerifierService} from '../../../service/verifier.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ApplicationService} from '../../../service/application.service';
import {Router} from '@angular/router';
import {DocumentService} from '../../../service/document.service';
import {Dialog} from '../../../../global/util/Dialog';
import {InformType} from '../../../../global/util/enum/InformType';
import {Constant} from '../../../../global/util/Constant';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {Document} from '../../../model/Document';
import {ElectronicSignature} from '../../../../global/util/ElectronicSignature';

@Component({
  selector: 'app-sign-document-internal',
  templateUrl: './sign-document-internal.component.html',
  styleUrls: ['./sign-document-internal.component.css']
})
export class SignDocumentInternalComponent implements OnInit {

  public title = 'Visor del documento';
  public urlStream;
  public document: Document;
  public documents: Document[];
  public resources: Resource[] = [];
  public loading: boolean;

  constructor(private verifierService: VerifierService,
              private activeModal: NgbActiveModal,
              private modalService: NgbModal,
              private applicationService: ApplicationService,
              private router: Router,
              private documentService: DocumentService) {
    Dialog.createInstance(modalService);
  }

  ngOnInit(): void {
    this.setDefaultValues();
  }

  public sign() {
    this.loading = true;
    const url = Constant.ROOT_API_V1.concat('/people/', String(LocalStorage.getPersonId()), '/suboperationtype/', String(ElectronicSignature.GRAPHIC_SIGNATURE), '/documents/sign');
    this.documentService.signElectronically(url, this.documents).subscribe(value => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
      this.processError('Firma', error);
    });
  }

  public cancel() {
    this.activeModal.close();
  }

  private setDefaultValues() {
    this.document = this.documents[0];
    this.documents.forEach(document => {
      document._more.resources.forEach(resource1 => this.resources.push(resource1));
    });
    this.selectAttachment(this.resources[0]);
  }

  public selectAttachment(resource: Resource) {
    this.urlStream = resource.url2;
  }

  public onProgress() {
    this.loading = true;
  }

  public loadComplete() {
    this.loading = false;
  }

  private processError(title: string, error: any) {
    const status = error.status;
    if (status) {
      if (HttpStatusCode.UNAUTHORIZED === status) {
        Dialog.show(InformType.Danger, title, error.error.message);
      } else if (HttpStatusCode.FORBIDDEN === status) {
        Dialog.show(InformType.Info, 'Sesión expirada', 'Su sesión expiró y fue cerrada automáticamente. Por favor inicie sesión nuevamente.');
        this.logout();
      } else if (HttpStatusCode.SERVICE_UNAVAILABLE === status) {
        Dialog.show(InformType.Danger, title, error.error.message, 160);
      } else {
        Dialog.show(InformType.Danger, title);
      }
    } else {
      Dialog.show(InformType.Danger, title, error.error.message);
    }
  }

  private logout() {
    this.applicationService.setUserLoggedIn(false);
    this.router.navigate(['login']);
  }
}
