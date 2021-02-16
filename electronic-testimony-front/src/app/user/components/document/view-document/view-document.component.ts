import {Component, OnInit} from '@angular/core';
import {Resource} from '../../../model/Resource';
import {Constant} from '../../../../global/util/Constant';
import {VerifierService} from '../../../service/verifier.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Traceability} from '../../../model/Traceability';
import {DocumentState} from '../../../../global/util/DocumentState';
import {InformType} from '../../../../global/util/enum/InformType';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {ApplicationService} from '../../../service/application.service';
import {Router} from '@angular/router';
import {TraceabilityType} from '../../../../global/util/TraceabilityType';
import {DocumentService} from '../../../service/document.service';
import {Dialog} from '../../../../global/util/Dialog';
import {Operator} from '../../../model/Operator';
import {ElectronicSignature} from '../../../../global/util/ElectronicSignature';

@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.css']
})
export class ViewDocumentComponent implements OnInit {

  public title = 'Visor del documento';
  public urlStream;
  public document: any;
  public resources: Resource[];
  public loading: boolean;
  public loadingOperators: boolean;
  public loadingTraceability: boolean;
  public loadingUpdateTraceability: boolean;
  public operatorsInfo: any[] = [];
  public traceabilities: Traceability[];
  public TRACEABILITY_SIGNATURE_COMPONENT = TraceabilityType.SIGNATURE_COMPONENT;
  public TRACEABILITY_VISUALIZACION = TraceabilityType.VISUALIZACION;
  public TRACEABILITY_MAILING = TraceabilityType.MAILING;
  private tracebilitytypes: number[] = [];
  private counterLoadFile = 0;
  public verificationUnavailable = false;

  constructor(private verifierService: VerifierService,
              private activeModal: NgbActiveModal,
              private modalService: NgbModal,
              private applicationService: ApplicationService,
              private router: Router,
              private documentService: DocumentService) {
    Dialog.createInstance(modalService);
    this.tracebilitytypes.push(TraceabilityType.BASIC);
  }

  ngOnInit(): void {
    this.loadTraceabilitiesBy();
    this.setDefaultValues();
  }

  public accept() {
    this.activeModal.close(InformType.Anything);
  }

  private setDefaultValues() {
    this.resources = this.document._more.resources;
    const resource = this.document._more.resources[0];
    this.selectAttachment(resource);
  }

  public selectAttachment(resource: Resource) {
    this.loadingOperators = true;
    const hashIdentifier = this.document.hashIdentifier;
    const hashResource = resource.hashResource;
    let urlVerifierOperators = '';
    if (Constant.FIRST_OPERATOR === this.document._more.orderNextSigner) {
      this.urlStream = Constant.ROOT_API_V1.concat('/public/documents/', String(this.document.id), '/', this.document.hashIdentifier, '/resources/', String(resource.orderResource), '/private/stream/traceability');
      this.loadingOperators = false;
    } else {
      if (hashResource) {
        urlVerifierOperators = Constant.ROOT_API_V1.concat('/documents/')
          .concat(hashIdentifier)
          .concat('/resources/')
          .concat(hashResource)
          .concat('/private/verifier');
        this.urlStream = Constant.ROOT_API_V1.concat('/public/documents/')
          .concat(hashIdentifier)
          .concat('/resources/')
          .concat(hashResource)
          .concat('/private/stream');
      } else {
        urlVerifierOperators = Constant.ROOT_API_V1.concat('/documents/')
          .concat(hashIdentifier)
          .concat('/private/verifier');
        this.urlStream = Constant.ROOT_API_V1.concat('/public/documents/')
          .concat(hashIdentifier)
          .concat('/stream');
      }
      this.verifierService.get(urlVerifierOperators).subscribe((next: any) => {
        this.loadingOperators = false;
        this.operatorsInfo = next._embedded.operatorsInfo;
      }, error => {
        this.loadingOperators = false;
        this.operatorsInfo = [];
        this.processError(this.title, error);
      });
    }
  }

  public onProgress() {
    this.loading = true;
  }

  public loadComplete() {
    this.loading = false;
    this.counterLoadFile += 1;
    if (Constant.FIRST_OPERATION === this.counterLoadFile) {
      this.updateTraceability();
    }
  }

  private updateTraceability() {
    this.loadingUpdateTraceability = true;
    const url = Constant.ROOT_API_V1.concat('/documents/', this.document.id, '/traceability/', String(TraceabilityType.VISUALIZACION), '/states/', String(DocumentState.VISUALIZED));
    this.documentService.postTraceability(url).subscribe(value => {
      this.loadingUpdateTraceability = false;
    }, error => {
      this.loadingUpdateTraceability = false;
      const title = 'Trazabilidad';
      this.processError(title, error);
    });
  }

  public getBadgeClassBy(stateId: number): string {
    switch (stateId) {
      case DocumentState.PENDING:
        return 'badge-info';
      case DocumentState.SIGNED:
        return 'badge-success';
      case DocumentState.REVIEWED:
        return 'badge-primary';
      case DocumentState.OBSERVED:
        return 'badge-warning';
      case DocumentState.FINISHED:
        return 'badge-dark';
      case DocumentState.DELIVERED:
        return 'custom-badge-delivered';
      case DocumentState.ATTENDED:
        return 'custom-badge-attended';
      case DocumentState.DOWNLOADED:
        return 'custom-badge-downloaded';
      case DocumentState.CANCELED:
        return 'badge-danger';
      case DocumentState.MODIFIED:
        return 'custom-badge-modified';
      case DocumentState.VISUALIZED:
        return 'custom-badge-visualized';
      case DocumentState.SCHEDULE_ATTACH_DELIVERY:
        return 'custom-badge-schedule-attach-delivery';
      case DocumentState.ATTACH_SENT:
        return 'custom-badge-attach-sent';
      case DocumentState.ERROR_SENDING_ATTACH:
        return 'custom-badge-error-sending-attach';
      case DocumentState.ES_GRAPHIC_SIGNATURE:
        return 'badge-secondary';
      default:
        break;
    }
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
        this.verificationUnavailable = true;
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

  get hasOperators(): boolean {
    return this.operatorsInfo.length > Constant.MINIMUM_OPERATOR;
  }

  public onItemChangeTraceability(event, traceabilityType: number) {
    switch (traceabilityType) {
      case TraceabilityType.SIGNATURE_COMPONENT:
        if (event.target.checked) {
          this.tracebilitytypes.push(TraceabilityType.SIGNATURE_COMPONENT);
        } else {
          const index = this.tracebilitytypes.findIndex(value => value === TraceabilityType.SIGNATURE_COMPONENT);
          this.tracebilitytypes.splice(index, 1);
        }
        break;
      case TraceabilityType.VISUALIZACION:
        if (event.target.checked) {
          this.tracebilitytypes.push(TraceabilityType.VISUALIZACION);
        } else {
          const index = this.tracebilitytypes.findIndex(value => value === TraceabilityType.VISUALIZACION);
          this.tracebilitytypes.splice(index, 1);
        }
        break;
      case TraceabilityType.MAILING:
        if (event.target.checked) {
          this.tracebilitytypes.push(TraceabilityType.MAILING);
        } else {
          const index = this.tracebilitytypes.findIndex(value => value === TraceabilityType.MAILING);
          this.tracebilitytypes.splice(index, 1);
        }
        break;
    }
    this.loadTraceabilitiesBy();
  }

  public loadTraceabilitiesBy() {
    const types = this.tracebilitytypes.join(',');
    this.loadingTraceability = true;
    const url = Constant.ROOT_API_V1.concat('/documents/', this.document.id, '/traceability?types=', types);
    this.documentService.get(url).subscribe((next: any) => {
      this.loadingTraceability = false;
      this.traceabilities = next._embedded.documenttraceabilities;
    }, error => {
      this.loadingTraceability = false;
      const title = 'Ver trazabilidad';
      this.processError(title, error);
    });
  }

  public getClassOperatorInfo(operatorInfo: Operator): string {
    if (Constant.CORRECT_OPERATION === operatorInfo.correctOperation) {
      if (Constant.OLD_SIGNATURE === operatorInfo.isOldSignature) {
        return 'fa-exclamation-circle custom-icon-alert';
      } else {
        switch (operatorInfo.operationId) {
          case Constant.SIGN_OPTION:
            if (operatorInfo.digitalSignature) {
              return 'fa-file-signature fa-check-circle custom-icon-success';
            } else {
              switch (operatorInfo.typeElectronicSignature) {
                case ElectronicSignature.GRAPHIC_SIGNATURE:
                  return 'fa-signature';
                default:
                  return 'fa-check-circle';
              }
            }
          case Constant.REVIEW_OPTION:
            return 'fa-check-circle custom-icon-primary';
        }
      }
    } else {
      return 'fa-times-circle custom-icon-warn';
    }
  }

  public showModalSignatureInfo(operatorInfo: any) {
    const title = 'Validez de firma';
    if (Constant.CORRECT_OPERATION === operatorInfo.correctOperation) {
      if (Constant.OLD_SIGNATURE === operatorInfo.isOldSignature) {
        Dialog.show(InformType.Warning, title, 'Debido a que el documento ya contaba con la firma seleccionada, no podemos garantizar que ésta haya sido realizada con un componente de firma acreditado ante la autoridad competente.');
      } else {
        Dialog.show(InformType.Success, title, 'La firma es válida debido a que fue realizada por un componente de firma acreditado ante la autoridad competente.');
      }
    } else {
      Dialog.show(InformType.Success, title, 'La firma no es válida, por favor verifique la integridad e información de los firmantes en el documento.');
    }
  }
}
