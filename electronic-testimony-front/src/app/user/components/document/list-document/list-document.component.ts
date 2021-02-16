import {Component, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {Page} from '../../../../global/util/enum/Page';
import {InformType} from '../../../../global/util/enum/InformType';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Constant} from '../../../../global/util/Constant';
import {DocumentService} from '../../../service/document.service';
import {AddDocumentBatchComponent} from '../add-document-batch/add-document-batch.component';
import {SignService} from '../../../service/sign.service';
import {ReviewDocumentComponent} from '../review-document/review-document.component';
import {AddDocumentOneComponent} from '../add-document-one/add-document-one.component';
import {DocumentUtil} from '../../../../global/util/DocumentUtil';
import {AuthService} from '../../../service/auth/auth.service';
import {ApplicationService} from '../../../service/application.service';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {NotificationService} from '../../../service/notification.service';
import {DocumentState} from '../../../../global/util/DocumentState';
import {StringUtil} from '../../../../global/util/StringUtil';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {PersonService} from '../../../service/person.service';
import {ViewParticipantComponent} from '../view-participant/view-participant.component';
import {ConfirmComponent} from '../../../../shared/confirm/confirm.component';
import {Response} from '../../../../global/util/enum/Response';
import {Stampdatetime} from '../../../model/Stampdatetime';
import {State} from '../../../model/State';
import {CloneTool} from '../../../../global/util/CloneTool';
import {AddDocumentOneDynamicComponent} from '../add-document-one-dynamic/add-document-one-dynamic.component';
import {ReasignParticipantComponent} from '../reasign-participant/reasign-participant.component';
import {CancelDocumentComponent} from '../cancel-document/cancel-document.component';
import {ViewObservationCancelComponent} from '../view-observation-cancel/view-observation-cancel.component';
import {Observationcancel} from '../../../model/Observationcancel';
import {Workflow} from '../../../model/Workflow';
import {SignType} from '../../../../global/util/enum/SignType';
import {Router} from '@angular/router';
import {ViewDocumentComponent} from '../view-document/view-document.component';
import {Person} from '../../../model/Person';
import {ReviewType} from '../../../../global/util/enum/ReviewType';
import {Dialog} from '../../../../global/util/Dialog';
import {SendToEmailComponent} from '../send-to-email/send-to-email.component';
import {MailtemplateService} from '../../../service/mailtemplate.service';
import {Mailtemplate} from '../../../model/Mailtemplate';
import {SignDocumentInternalComponent} from '../sign-document-internal/sign-document-internal.component';
import {Document} from '../../../model/Document';

@Component({
  selector: 'app-list-document',
  templateUrl: './list-document.component.html',
  styleUrls: ['./list-document.component.css']
})
export class ListDocumentComponent implements OnInit, OnDestroy {

  public documents: any[] = [];
  public page: any = {};
  public links: any = {};
  private documentUrl: string;
  public enumPage = Page;
  public loading: boolean;
  private entityName = 'Documento';
  public title = 'Documentos';
  private selectedDocuments: any[] = [];
  public checkedShowAllOption = false;
  private interval: any;
  public calledOfAutorefresh = false;
  public loadingSign = false;
  public loadingSave = false;
  public loadingShowBy = false;
  private personId;
  public enterprises: any[] = [];
  public enterpriseIdSelected: number;
  public enterpriseSelected: any;
  public workflows: any[] = [];
  public workflowSelected: any;
  public workflowIdSelected: number;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public ROLE_USER = Constant.ROLE_USER;
  public ROLE_ASSISTANT = Constant.ROLE_ASSISTANT;
  public ROLE_SUPERVISOR = Constant.ROLE_SUPERVISOR;
  public loadingCopyClipboard = false;
  public term2Search: string;
  public officialTerm2Search: string;
  public states: State[] = [];
  public selectedStates: State[] = [];
  public SIGNTYPE_ONE2ONE = SignType.One2One;
  public SIGNTYPE_BATCH = SignType.Batch;
  public SIGNTYPE_DYNAMIC = SignType.Dynamic;
  public myPendingState: State = new State();
  public pendingState: State = new State();
  public REVIEWTYPE_ONE2ONE = ReviewType.One2One;
  public REVIEWTYPE_BATCH = ReviewType.Batch;

  constructor(private sanitizer: DomSanitizer,
              private modalService: NgbModal,
              private documentService: DocumentService,
              private signService: SignService,
              private authenticationService: AuthService,
              private applicationService: ApplicationService,
              private notificationService: NotificationService,
              private personService: PersonService,
              private router: Router,
              private mailtemplateService: MailtemplateService) {
    Dialog.createInstance(modalService);
    this.setDefaultData();
    this.loadDocuments(Page.First);
  }

  ngOnInit() {
    this.beginAutorefreh();
  }

  ngOnDestroy(): void {
    this.destroyAutorefresh();
  }

  private setDefaultData() {
    this.personId = LocalStorage.getPersonId();
    this.enterpriseIdSelected = LocalStorage.getEnterpriseIdView();
    if (this.hasRole(this.ROLE_PARTNER)) {
      const partnerId = LocalStorage.getPartnerId();
      this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(partnerId);
      this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
      this.enterpriseIdSelected = this.enterpriseSelected.id;
      this.workflows = LocalStorage.getWorkflows(this.enterpriseIdSelected);
    } else if (this.hasRole(this.ROLE_ADMIN)) {
      this.enterpriseIdSelected = this.authenticationService.getEnterpriseIdView();
      this.workflows = LocalStorage.getWorkflows(this.enterpriseIdSelected);
    } else {
      this.enterpriseIdSelected = this.authenticationService.getEnterpriseId();
      this.workflows = LocalStorage.getWorkflowsByPerson();
    }
    this.workflowSelected = this.workflows[Constant.ZERO_INDEX];
    this.workflowIdSelected = this.workflowSelected.id;
    this.states = LocalStorage.getStates();
    this.stablishMyPendingState();
    this.stablishPendingState();
    if (this.hasRole(this.ROLE_SUPERADMIN) || this.hasRole(this.ROLE_ADMIN) || this.hasRole(this.ROLE_SUPERVISOR)) {
      this.pushDefaultStateValue4Adms();
    } else if (this.hasRole(this.ROLE_ASSISTANT)) {
      this.pushDefaultStateValue4Assistants();
    } else {
      this.pushDefaultStateValue4NotAdms();
    }
  }

  private stablishMyPendingState() {
    this.myPendingState = CloneTool.do(this.states.find(value => value.id === DocumentState.MY_PENDINGS));
    const index = this.states.findIndex(value => DocumentState.MY_PENDINGS === value.id);
    this.states.splice(index, 1);
  }

  private stablishPendingState() {
    this.pendingState = CloneTool.do(this.states.find(value => value.id === DocumentState.PENDING));
    // const index = this.states.findIndex(value => DocumentState.MY_PENDINGS === value.id);
    // this.states.splice(index, 1);
  }

  public reloadDocuments1() {
    this.enterpriseIdSelected = this.enterpriseSelected.id;
    this.workflows = LocalStorage.getWorkflows(this.enterpriseIdSelected);
    this.documents = [];
    if (Constant.EMPTY_LIST !== this.workflows.length) {
      this.workflowSelected = this.workflows[Constant.ZERO_INDEX];
      this.workflowIdSelected = this.workflowSelected.id;
      this.loadDocuments(Page.First);
    }
  }

  public reloadDocuments2() {
    this.officialTerm2Search = this.term2Search;
    this.documents = [];
    this.workflowIdSelected = this.workflowSelected.id;
    this.loadDocuments(Page.First);
  }

  public loadDocuments(page: Page, callAutorefresh?: string): void {
    this.calledOfAutorefresh = false;
    if (callAutorefresh) {
      this.calledOfAutorefresh = true;
    }
    if (this.officialTerm2Search === undefined) {
      this.officialTerm2Search = '';
    }
    const stateIdentifiers = this.removeInnecesaryStateIds(StringUtil.concatIdentifiers2(this.selectedStates, ','));
    switch (page) {
      case Page.First:
        if (this.hasRole(this.ROLE_PARTNER) || this.hasRole(this.ROLE_ADMIN) || this.hasRole(this.ROLE_SUPERVISOR)) {
          this.documentUrl = Constant.ROOT_API_V1
            .concat('/enterprises/')
            .concat(String(this.enterpriseIdSelected))
            .concat('/workflows/')
            .concat(String(this.workflowIdSelected))
            .concat('/documents')
            .concat('?findby=')
            .concat(this.officialTerm2Search)
            .concat('&states=')
            .concat(stateIdentifiers);
        } else if (this.hasRole(this.ROLE_ASSISTANT)) {
          this.documentUrl = Constant.ROOT_API_V1
            .concat('/enterprises/')
            .concat(String(this.enterpriseIdSelected))
            .concat('/workflows/')
            .concat(String(this.workflowIdSelected))
            .concat('/people/')
            .concat(String(this.personId))
            .concat('/documents')
            .concat('?findby=')
            .concat(this.officialTerm2Search)
            .concat('&states=')
            .concat(stateIdentifiers);
        } else {
          // TODO ROLE_USER list view
          this.documentUrl = Constant.ROOT_API_V1
            .concat('/enterprises/')
            .concat(String(this.enterpriseIdSelected))
            .concat('/workflows/')
            .concat(String(this.workflowIdSelected))
            .concat('/people/')
            .concat(String(this.personId))
            .concat('/user/documents')
            .concat('?findby=')
            .concat(this.officialTerm2Search)
            .concat('&states=')
            .concat(stateIdentifiers);
        }
        break;
      case Page.Previous:
        this.documentUrl = this.links.prev.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Next:
        this.documentUrl = this.links.next.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Last:
        this.documentUrl = this.links.last.href.replace('http', Constant.SCHEMA);
        break;
      default:
        this.documentUrl = this.links.self.href.replace('http', Constant.SCHEMA);
        break;
    }
    if (this.authenticationService.isAuthenticated()) {
      this.getDocuments(this.documentUrl);
    }
  }

  private beginAutorefreh() {
    this.interval = setInterval(() => {
      if (this.documents.length !== 0) {
        this.loadDocuments(Page.Self, 'auto');
      } else {
        this.loadDocuments(Page.First, 'auto');
      }
    }, 60000);
  }

  private destroyAutorefresh() {
    clearInterval(this.interval);
  }

  private getDocuments(url: string) {
    this.loading = true;
    this.documentService.get(url).subscribe((next: any) => {
      this.loadingShowBy = this.loading = false;
      if (next._embedded) {
        this.documents = next._embedded.documents;
      } else {
        this.documents = [];
      }
      this.page = next.page;
      this.links = next._links;
    }, error => {
      this.destroyAutorefresh();
      this.loading = false;
      this.processError(this.title, error);
    });
  }

  openModalAddBatch() {
    const modalRef = this.modalService.open(AddDocumentBatchComponent, {
      backdrop: 'static',
      size: 'xl'
    });
    modalRef.componentInstance.enterpriseIdSelected = this.enterpriseIdSelected;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadDocuments(Page.Self);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public getUrlsSign(document: any): SafeUrl {
    const urlFrom = DocumentUtil.buildUrlDownload(document);
    const urlTo = DocumentUtil.buildUrlUpload(document, this.personId);
    if (document._more.stampdatetime) {
      const stampdatetime: Stampdatetime = document._more.stampdatetime;
      return this.sanitizer.bypassSecurityTrustResourceUrl('rsign:?from='
        .concat(urlFrom)
        .concat('&to=')
        .concat(urlTo)
        .concat('&vis_sig_x=')
        .concat(String(stampdatetime.positionX))
        .concat('&vis_sig_y=')
        .concat(String(stampdatetime.positionY))
        .concat('&vis_sig_width=')
        .concat(String(stampdatetime.widthContainer))
        .concat('&vis_sig_height=')
        .concat(String(stampdatetime.heightContainer))
        .concat('&vis_sig_text=')
        .concat(stampdatetime.description)
        .concat('&vis_sig_page=')
        .concat(String(stampdatetime.stampOn))
      );
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl('rsign:?from='
      .concat(urlFrom)
      .concat('&to=')
      .concat(urlTo));
  }

  public addOrRemove(event, document: any) {
    if (event.target.checked) {
      this.selectedDocuments.push(document);
    } else {
      const index = this.getIndexOf(document);
      this.selectedDocuments.splice(index, 1);
    }
  }

  public wasSelected(document: any): boolean {
    return this.isAdded(document);
  }

  private isAdded(document: any): boolean {
    return this.selectedDocuments.find(value => value.id === document.id) !== undefined;
  }

  private getIndexOf(document: any): number {
    return this.selectedDocuments.findIndex(value => value.id === document.id);
  }

  private getIndexOfState(state: State): number {
    return this.selectedStates.findIndex(value => value.id === state.id);
  }

  public addOrRemoveAll(event) {
    if (event.target.checked) {
      this.documents.filter(document => !this.isAdded(document)).forEach(document => this.selectedDocuments.push(document));
    } else {
      this.documents.filter(document => this.isAdded(document)).forEach(document => this.selectedDocuments.splice(this.getIndexOf(document), 1));
    }
  }

  public wasAllSelected(): boolean {
    if (this.selectedDocuments.length === 0) {
      return false;
    }
    return !(this.documents.find(document => !this.isAdded(document)) !== undefined);
  }

  public signDigitallyBatch(): void {
    const documents2Sign: any[] = this.selectedDocuments.filter(document =>
      this.hasUniqueAttachDigitalSignatureOption(document)
      || this.hasMultipleAttachDigitalSignatureOption(document));
    if (Constant.EMPTY_LIST === documents2Sign.length) {
      Dialog.show(InformType.Info, this.title, 'Los documentos seleccionados no están pendientes de su firma.');
      this.selectedDocuments = [];
      return;
    }
    const identifiers = StringUtil.concatIdentifiers(documents2Sign);
    this.signBatchBy(identifiers);
  }

  public signElectronicallyBatch(): void {
    const documents2Sign: any[] = this.selectedDocuments.filter(document => this.hasElectronicSignatureOption(document));
    if (Constant.EMPTY_LIST === documents2Sign.length) {
      Dialog.show(InformType.Info, this.title, 'Los documentos seleccionados no están pendientes de su firma.');
      this.selectedDocuments = [];
      return;
    }
    this.openModalSignDocumentInternal2(documents2Sign);
  }

  public reviewBatch() {
    const documents2Review: any[] = this.selectedDocuments.filter(document => this.hasReviewOption(document));
    if (Constant.EMPTY_LIST === documents2Review.length) {
      Dialog.show(InformType.Info, this.title, 'Los documentos seleccionados no están pendientes de revisión por parte suya.');
      this.selectedDocuments = [];
      return;
    }
    this.openModalReview2(this.selectedDocuments, ReviewType.Batch, 'xl');
  }

  // TODO correct pass parameters, services shouldn't build urls
  public checkStatusOne2One(document: any) {
    const urlOne2One = Constant.ROOT_API_V1.concat('/public/signs/one2one/status')
      .concat('?personId=')
      .concat(String(this.personId))
      .concat('&documentId=')
      .concat(document.id);
    this.loadingSign = true;
    const interval = setInterval(() => {
      this.documentService.get(urlOne2One).subscribe((next: any) => {
        if (next.completed === Constant.FINISHED) {
          Dialog.show(InformType.Success, this.entityName);
          clearInterval(interval);
          this.loadDocuments(Page.Self);
          this.selectedDocuments = [];
          this.loadingSign = false;
          this.loadActualBalance();
        }
      }, error => {
        this.processError(this.title, error);
      });
    }, 2000);
  }

  private loadActualBalance(): void {
    this.loading = true;
    const url = Constant.ROOT_API_V1 + '/actualbalance';
    this.applicationService.get(url).subscribe((value: any) => {
      LocalStorage.setBalanceInfo(value._embedded);
      this.loading = false;
    }, error => {
      this.loading = false;
      this.processError('Saldo actual', error);
    });
  }

  public downloadOf(documentsource: any) {
    const url = documentsource._links.stream.href.replace('http', Constant.SCHEMA);
    const more = documentsource._more;
    this.documentService.getDocumentsOf(url).subscribe(next => {
      const control = document.createElement('a');
      control.setAttribute('style', 'display:none;');
      document.body.appendChild(control);
      control.href = window.URL.createObjectURL(next);
      const today = LocalStorage.getTodayString();
      const filename = more.basenameFile.concat(more.suffix === undefined ? '' : more.suffix, '.', more.extension);
      control.download = filename;
      control.click();
    }, error => {
      const title = 'Descargar documentos';
      this.processError(title, error);
    });
  }

  public hasUniqueAttachSignOption(document: Document) {
    return !document.finished &&
      (this.personId === document._more.personId) &&
      (Constant.SIGN_OPTION === document._more.operationId) &&
      (document.active === Constant.ACTIVE) &&
      (document.hasMultipleAttachments !== Constant.HAS_MULTIPLE_ATTACHMENTS) &&
      !this.wasCanceled(document);
  }

  /**
   * Evaluamos si tiene el permiso de firma digital sobre un documento que tiene un único adjunto.
   */
  public hasUniqueAttachDigitalSignatureOption(document: Document) {
    return this.hasUniqueAttachSignOption(document) && document._more.digitalSignature;
  }

  /**
   * Evaluamos el permiso de firma electrónica que tenga uno o más adjuntos
   */
  public hasElectronicSignatureOption(document: Document) {
    return (this.hasUniqueAttachSignOption(document) || this.hasMultipleAttachSignOption(document)) && !document._more.digitalSignature;
  }

  public hasReviewOption(document: any) {
    return !document.finished &&
      (this.personId === document._more.personId) &&
      (Constant.REVIEW_OPTION === document._more.operationId) &&
      (document.active === Constant.ACTIVE) &&
      !this.wasCanceled(document);
  }

  public hasResendMailOption(document: any): boolean {
    return !document.finished && (document._more.participantType === Constant.INVITED) &&
      (document.active === Constant.ACTIVE) && !this.isInvitedUser;
  }

  public hasCopyUrlOption(document: any): boolean {
    return !document.finished && (document._more.mandatoryOperator === Constant.NOT_MANDATORY) &&
      (document.active === Constant.ACTIVE) && !this.isInvitedUser;
  }

  public hasCancelOption(document: any) {
    return this.hasUniqueAttachSignOption(document) || this.hasReviewOption(document) || this.hasMultipleAttachSignOption(document);
  }

  public isAllowedDelete(document: any): boolean {
    return !this.wasCanceled(document) && !this.wasFinished(document) && !this.wasDelivered(document) && !this.wasAttended(document) && Constant.FIRST_OPERATION === document._more.orderNextSigner;
  }

  public wasCanceled(document: any): boolean {
    return Constant.INACTIVE === document.active || DocumentState.CANCELED === document.stateId;
  }

  get hasAdminRoleOrMore(): boolean {
    return this.hasRole(this.ROLE_ADMIN) || this.hasRole(this.ROLE_PARTNER);
  }

  //TODO refactorizar el parámetro modalsize de no ser necesario en adelante
  public openModalReview(document: any, reviewType: ReviewType) {
    if (ReviewType.One2One === reviewType) {
      const documents: any[] = [];
      documents.push(document);
      const modalSize = document._more.resources.length > 1 ? 'xl' : 'lg';
      this.openModalReview2(documents, ReviewType.One2One, 'xl');
    }
  }

  public openModalReview2(documents: any[], reviewType: ReviewType, modalSize: string) {
    const modalRef = this.modalService.open(ReviewDocumentComponent, {
      backdrop: 'static',
      size: modalSize
    });
    modalRef.componentInstance.reviewType = reviewType;
    modalRef.componentInstance.documents = documents;
    modalRef.componentInstance.personId = this.personId;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.selectedDocuments = [];
        this.loadDocuments(Page.Self);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public openModalAddOne() {
    const modalRef = this.modalService.open(AddDocumentOneComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.enterpriseIdSelected = this.enterpriseIdSelected;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadDocuments(Page.Self);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public openModalAddOneDynamically() {
    const modalRef = this.modalService.open(AddDocumentOneDynamicComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.enterpriseIdSelected = this.enterpriseIdSelected;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadDocuments(Page.Self);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  get isEmptySelectedList(): boolean {
    return this.selectedDocuments.length === 0;
  }

  public hasComment(document: any): boolean {
    if (document._more) {
      return Constant.HAS_COMMENT === document._more.hasComment || this.wasCanceled(document) || this.wasModified(document);
    }
  }

  public wasObserved(document: any): boolean {
    if (document._more) {
      return Constant.OBSERVED === document._more.observed;
    }
  }

  public openModalCancel(document: any) {
    const modalRef = this.modalService.open(CancelDocumentComponent);
    modalRef.componentInstance.document = document;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        Dialog.show(InformType.Success, this.entityName);
        this.loadDocuments(Page.Self);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public viewObservation(document: any) {
    const documentId = document.id;
    let url;
    if (this.wasModified(document)) {
      url = Constant.ROOT_API_V1.concat('/documents/', documentId, '/obsmodification');
    } else {
      url = Constant.ROOT_API_V1.concat('/documents/', documentId, '/obscancel');
    }
    this.loadingSave = true;
    this.documentService.get(url).subscribe((observation: Observationcancel) => {
      this.loadingSave = false;
      this.openModalViewObservation(document, observation);
    }, error => {
      this.loadingSave = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  public openModalViewObservation(document?: any, observationcancel?: Observationcancel) {
    const modalRef = this.modalService.open(ViewObservationCancelComponent, {size: 'lg'});
    modalRef.componentInstance.observationcancel = observationcancel;
    modalRef.componentInstance.document = document;
  }

  public resendMailSigner(document: any) {
    const personId = document._more.personId;
    const hashIdentifier = document.hashIdentifier;
    const url = Constant.ROOT_API_V1.concat('/notifications/', personId, '/people/', hashIdentifier, '/documents/resend');
    this.loading = true;
    this.notificationService.resend(url).subscribe(next => {
      this.loading = false;
      Dialog.show(InformType.Success, 'Reenvío de correo');
    }, error => {
      this.loading = false;
      const title = 'Reenvío de correo';
      this.processError(title, error);
    });
  }

  public copyToClipboard(documentSelected: any) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = documentSelected._more.urlSignOperator;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.loadingCopyClipboard = true;
    setTimeout(() => {
      this.loadingCopyClipboard = false;
    }, 300);
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  public openModalAttend(document?: any) {
    let listDocuments: any[] = [];
    if (document) {
      listDocuments.push(document);
    } else {
      listDocuments = this.selectedDocuments;
    }
    const modalRef = this.modalService.open(ConfirmComponent);
    modalRef.componentInstance.title = 'Atender documento';
    modalRef.componentInstance.body = this.buildBodyContent(listDocuments);
    modalRef.result.then((result) => {
      if (Response.Yes === result) {
        this.attendUnattend(this.personId, listDocuments, DocumentState.ATTENDED);
      }
    });
  }

  private buildBodyContent(listDocuments: any[]): string {
    const lengthList = listDocuments.length;
    if (lengthList > 1) {
      return '¿Está seguro que desea atender los ' + lengthList + ' documentos?';
    }
    return '¿Está seguro que desea atender el documento?';
  }

  private attendUnattend(personId: number, listDocuments: any[], documentState: number) {
    const attendUnattendUrl = Constant.ROOT_API_V1
      .concat('/people/')
      .concat(String(this.personId))
      .concat('/states/')
      .concat(String(documentState))
      .concat('/documents/update');
    this.loading = true;
    this.documentService.update(attendUnattendUrl, listDocuments).subscribe(next => {
      this.loading = false;
      this.selectedDocuments = [];
      this.checkedShowAllOption = false;
      this.loadDocuments(Page.Self);
      Dialog.show(InformType.Success, this.entityName);
    }, error => {
      this.loading = false;
      this.processError(this.title, error);
    });
  }

  public hasMarkAttendOption(document: any) {
    return !this.wasAttended(document) && Constant.FINISHED === document.finished && !this.isInvitedUser;
  }

  public hasMarkUnattendOption(document: any) {
    return this.wasAttended(document) && !this.isInvitedUser;
  }

  public wasAttended(document: any): boolean {
    return DocumentState.ATTENDED === document.stateId;
  }

  public wasDelivered(document: any): boolean {
    return DocumentState.DELIVERED === document.stateId;
  }

  public wasFinished(document: Document): boolean {
    return DocumentState.FINISHED === document.stateId;
  }

  public wasMailSent(document: any): boolean {
    return DocumentState.ATTACH_SENT === document.stateId;
  }

  public hasSentAttachByMailOption(document: any) {
    return Constant.FINISHED === document.finished && !this.isInvitedUser && !this.wasCanceled(document);
  }

  public getSpanClass(document: any): string {
    if (this.wasAttended(document)) {
      return 'badge badge-success';
    } else if (this.wasDelivered(document)) {
      return 'badge badge-warning';
    } else if (this.wasFinished(document)) {
      return 'badge badge-info';
    } else if (this.wasCanceled(document)) {
      return 'badge badge-danger';
    } else if (this.wasMailSent(document)) {
      return 'badge custom-badge-attach-sent';
    } else if (this.wasModified(document)) {
      return 'badge custom-badge-modified';
    } else {
      return '';
    }
  }

  public hasMultipleAttachDigitalSignatureOption(document: Document) {
    return this.hasMultipleAttachSignOption(document) && document._more.digitalSignature;
  }

  public hasMultipleAttachSignOption(document: Document) {
    return !document.finished &&
      (this.personId === document._more.personId) &&
      (Constant.SIGN_OPTION === document._more.operationId) &&
      (document.active === Constant.ACTIVE) &&
      (document.hasMultipleAttachments === Constant.HAS_MULTIPLE_ATTACHMENTS) &&
      !this.wasCanceled(document);
  }

  public signBy(document: any) {
    const identifiers = document.id;
    this.signBatchBy(identifiers);
  }

  public signBatchBy(identifiers: string) {
    this.signService.getUUID(this.personId, identifiers).subscribe((next: any) => {
      const fromUrl = Constant.ROOT_API_V1
        .concat('/public/signs/batch/stream?uuid=')
        .concat(next.uuid);
      const rsignUrl = 'rsign:?batch_csv='.concat(fromUrl);
      window.open(rsignUrl, '_self');

      const checkStatusBatchUrl = Constant.ROOT_API_V1
        .concat('/public/signs/batch/status')
        .concat('?uuid=')
        .concat(next.uuid)
        .concat('&personId=')
        .concat(String(this.personId));
      this.loadingSign = true;
      const interval = setInterval(() => {
        this.documentService.get(checkStatusBatchUrl).subscribe((next2: any) => {
          if (next2.completed === Constant.FINISHED) {
            Dialog.show(InformType.Success, this.entityName);
            clearInterval(interval);
            this.loadDocuments(Page.Self);
            this.selectedDocuments = [];
            this.checkedShowAllOption = false;
            this.loadingSign = false;
            this.loadActualBalance();
          }
        }, error => {
          this.processError(this.title, error);
        });
      }, 3000);
    }, error => {
      this.processError(this.title, error);
    });
  }

  get isInvitedUser(): boolean {
    return Constant.INVITED_USER === LocalStorage.getParticipantType();
  }

  public hasWorkflowsBy(signType: SignType): boolean {
    if (this.hasRole(this.ROLE_PARTNER)) {
      return true;
    }
    const workflows = DocumentUtil.extractOnlyNecesaryWorkflowsBy(this.workflowsByPerson, signType);
    return workflows.length > 0;
  }

  get workflowsByPerson(): Workflow[] {
    if (this.hasRole(this.ROLE_ADMIN)) {
      const enterpriseId = LocalStorage.getEnterpriseId();
      return LocalStorage.getWorkflows(enterpriseId);
    } else {
      return LocalStorage.getWorkflowsByPerson();
    }
  }

  public openModalViewParticipants(document: any) {
    let list: Person[];
    const fromUrl = Constant.ROOT_API_V1
      .concat('/documents/')
      .concat(document.id)
      .concat('/people');
    this.personService.get(fromUrl).subscribe((value: any) => {
      list = value._embedded.people;
      const modalRef = this.modalService.open(ViewParticipantComponent, {
        backdrop: 'static',
        size: 'lg'
      });
      modalRef.componentInstance.peopleReceived = list;
    }, error => {
      const title = 'Participantes';
      this.processError(title, error);
    });
  }

  public openModalReassignParticipants(document: any) {
    let list: any[];
    const fromUrl = Constant.ROOT_API_V1
      .concat('/documents/')
      .concat(document.id)
      .concat('/people');
    this.personService.get(fromUrl).subscribe((value: any) => {
      list = value._embedded.people;
      const modalRef = this.modalService.open(ReasignParticipantComponent, {
        backdrop: 'static',
        size: 'lg'
      });
      modalRef.componentInstance.people = list;
      modalRef.componentInstance.document = document;
      modalRef.result.then((result) => {
        if (InformType.Success === result) {
          Dialog.show(InformType.Success, this.entityName);
          this.loadDocuments(Page.Self);
        }
      });
    }, error => {
      this.processError(this.title, error);
    });
  }

  public search() {
    this.officialTerm2Search = this.term2Search;
    this.reloadDocuments2();
  }

  public hasViewParticipantsOption(document: any) {
    return !this.isInvitedUser;
  }

  public hasReassignParticipantsOption(document: any) {
    return Constant.DYNAMICALLY === document._more.dynamicWorkflow && !this.wasCanceled(document) && !this.wasFinished(document) && !this.wasDelivered(document) && !this.wasAttended(document);
  }

  public downloadMultipleDocuments() {
    const url = Constant.ROOT_API_V1
      .concat('/enterprises/')
      .concat(String(this.enterpriseIdSelected))
      .concat('/documents/stream');
    const docIdentifiers = StringUtil.concatIdentifiers(this.selectedDocuments);
    const formData = new FormData();
    formData.append('docIdentifiers', docIdentifiers);
    this.documentService.getMultipleDocuments(url, formData).subscribe(next => {
      const control = document.createElement('a');
      control.setAttribute('style', 'display:none;');
      document.body.appendChild(control);
      control.href = window.URL.createObjectURL(next);
      const today = LocalStorage.getTodayString();
      control.download = 'IOFESign-' + today + '-signed.zip';
      control.click();
    }, error => {
      const title = 'Descargar documentos';
      this.processError(title, error);
    });
  }

  public hasDeleteOption(document: any) {
    return this.isAllowedDelete(document) && document.personId === this.personId;
  }

  public openModalDelete(document: any) {
    const modalRef = this.modalService.open(ConfirmComponent);
    modalRef.componentInstance.title = 'Eliminar documento';
    modalRef.componentInstance.body = '¿Está seguro que desea eliminar el documento?';
    modalRef.result.then((result) => {
      if (Response.Yes === result) {
        this.deleteDocument(document);
      }
    });
  }

  private deleteDocument(document: any) {
    this.loadingSave = true;
    this.documentService.delete(document).subscribe(next => {
      this.loadingSave = false;
      this.loadDocuments(Page.Self);
      Dialog.show(InformType.Success, this.entityName);
    }, error => {
      this.loadingSave = false;
      const title = 'Eliminar documento';
      this.processError(title, error);
    });
  }

  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }

  public openModalUnattend(document?: any) {
    let listDocuments: any[] = [];
    if (document) {
      listDocuments.push(document);
    } else {
      listDocuments = this.selectedDocuments;
    }
    const modalRef = this.modalService.open(ConfirmComponent);
    modalRef.componentInstance.title = 'Desatender documento';
    modalRef.componentInstance.body = '¿Está seguro que desea desatender el/los documento(s)?';
    modalRef.result.then((result) => {
      if (Response.Yes === result) {
        this.attendUnattend(this.personId, listDocuments, DocumentState.FINISHED);
      }
    });
  }

  public addRemoveState(event, state: State) {
    this.loadingShowBy = true;
    if (DocumentState.MY_PENDINGS === state.id) {
      if (event.target.checked) {
        this.selectedStates = [];
        this.selectedStates.push(this.myPendingState);
      } else {
        this.pushDefaultStateValue4Adms();
      }
    } else {
      if (event.target.checked) {
        const index = this.selectedStates.findIndex(value => DocumentState.MY_PENDINGS === value.id);
        if (index !== -1) {
          this.selectedStates.splice(index, 1);
        }
        if (DocumentState.ALL === state.id) {
          for (const state1 of this.states) {
            if (!this.wasSelected2(state1)) {
              const clonedState = CloneTool.do(state1);
              this.selectedStates.push(clonedState);
            }
          }
        } else {
          this.selectedStates.push(state);
        }
      } else {
        if (DocumentState.ALL !== state.id && DocumentState.MY_PENDINGS !== state.id) {
          const index = this.selectedStates.findIndex(value => DocumentState.ALL === value.id);
          if (index !== -1) {
            this.selectedStates.splice(index, 1);
          }
        }
        if (this.selectedStates.length === 1) {
          this.loadingShowBy = false;
          event.target.checked = true;
          return;
        }
        if (DocumentState.ALL === state.id) {
          this.pushDefaultStateValue4NotAdms();
        } else {
          const index = this.getIndexOfState(state);
          this.selectedStates.splice(index, 1);
        }
      }
    }
    this.loadDocuments(Page.First);
  }

  public wasSelected2(state: State): boolean {
    if (DocumentState.ALL === state.id) {
      return this.selectedStates.length === this.states.length || this.otherWasSelected();
    }
    return this.selectedStates.find(value => value.id === state.id) !== undefined;
  }

  private pushDefaultStateValue4NotAdms() {
    this.selectedStates = [];
    this.selectedStates.push(this.myPendingState);
  }

  private pushDefaultStateValue4Adms() {
    this.selectedStates = [];
    this.states.forEach(state => {
      if (DocumentState.MY_PENDINGS !== state.id) {
        const state1 = CloneTool.do(state);
        this.selectedStates.push(state1);
      }
    });
  }

  private pushDefaultStateValue4Assistants() {
    this.selectedStates = [];
    this.selectedStates.push(this.pendingState);
  }

  private removeInnecesaryStateIds(identifiers: string) {
    return identifiers.split(',').filter(identifier => DocumentState.ALL !== +identifier).join(',');
  }

  private otherWasSelected() {
    const clonedStates: State[] = CloneTool.doList(this.states);
    for (let index = 0; index < clonedStates.length; index++) {
      const state = clonedStates[index];
      if (DocumentState.ALL === state.id) {
        clonedStates.splice(index, 1);
      }
    }
    for (const state of clonedStates) {
      if (!this.wasSelected2(state)) {
        return false;
      }
    }
    return true;
  }

  public getBadgeTextBy(document: any): string {
    if (DocumentState.CANCELED === document.stateId) {
      return 'badge-danger';
    } else if (DocumentState.MODIFIED === document.stateId) {
      return 'custom-badge-modified';
    } else {
      const commentsInfo: any[] = document._more.commentsInfo;
      if (commentsInfo) {
        const commentObserved = commentsInfo.find(value => Constant.OBSERVED === value.observed);
        if (commentObserved) {
          return 'badge-warning';
        } else {
          return 'badge-info';
        }
      }
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

  public view(document: Document) {
    this.loadingSave = true;
    const url = Constant.ROOT_API_V1.concat('/documents/', String(document.id), '/traceability');
    this.documentService.get(url).subscribe((next: any) => {
      this.loadingSave = false;
      const traceabilities = next._embedded.documenttraceabilities;
    }, error => {
      this.loadingSave = false;
      const title = 'Ver trazabilidad';
      this.processError(title, error);
    });
  }

  public openModalViewDocument(document: Document) {
    const modalRef = this.modalService.open(ViewDocumentComponent, {
      backdrop: 'static',
      size: 'xl'
    });
    modalRef.componentInstance.document = document;
  }

  public openModalSendDocumentViaEmail(document: Document) {
    this.loading = true;
    const url = Constant.ROOT_API_V1 + '/enterprises/' + LocalStorage.getEnterpriseId() + '/documents/' + document.id + '/mailtemplateTypes/10/participantTypes/10/mailtemplates';
    this.mailtemplateService.get(url).subscribe((mailtemplate: Mailtemplate) => {
      this.loading = false;
      const modalRef = this.modalService.open(SendToEmailComponent, {
        backdrop: 'static',
        size: 'lg'
      });
      modalRef.componentInstance.document = document;
      modalRef.componentInstance.mailtemplate = mailtemplate;
      modalRef.result.then((result) => {
        if (InformType.Success === result) {
          this.loadDocuments(Page.Self);
        }
      });
    }, error => {
      this.loading = false;
      const title = 'Ver trazabilidad';
      this.processError(title, error);
    });
  }

  public openModalSignDocumentInternal(document: Document) {
    const documents: Document[] = [];
    documents.push(document);
    this.openModalSignDocumentInternal2(documents);
  }

  public openModalSignDocumentInternal2(documents: Document[]) {
    const modalRef = this.modalService.open(SignDocumentInternalComponent, {
      backdrop: 'static',
      size: 'xl'
    });
    modalRef.componentInstance.documents = documents;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        Dialog.show(InformType.Success, 'Firma electrónica', 'La firma electrónica se realizó satisfactoriamente');
        this.loadDocuments(Page.Self);
      }
    });
  }

  public openModalModifyDocument(document: Document) {
    const modalRef = this.modalService.open(AddDocumentOneComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.enterpriseIdSelected = this.enterpriseIdSelected;
    modalRef.componentInstance.document2Modify = document;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadDocuments(Page.Self);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public wasModified(document: Document): boolean {
    return Constant.ACTIVE === document.active && DocumentState.MODIFIED === document.stateId;
  }

  public hasModifyOption(document: Document) {
    return !this.wasModified(document) && !this.wasCanceled(document) && Constant.FINISHED === document.finished;
  }
}
