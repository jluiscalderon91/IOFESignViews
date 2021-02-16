import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DocumentUtil} from '../../../global/util/DocumentUtil';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {DocumentService} from '../../../user/service/document.service';
import {Constant} from '../../../global/util/Constant';
import {Document} from '../../../user/model/Document';
import {InformType} from '../../../global/util/enum/InformType';
import {PersonService} from '../../../user/service/person.service';
import {Person} from '../../../user/model/Person';
import {PDFDocumentProxy, PDFProgressData} from 'pdfjs-dist';
import HttpStatusCode from '../../../global/util/HttpStatusCode';
import {SignService} from '../../../user/service/sign.service';
import {Dialog} from '../../../global/util/Dialog';
import {SignDocumentInternalComponent} from '../../../user/components/document/sign-document-internal/sign-document-internal.component';
import {ConfirmComponent} from '../../../shared/confirm/confirm.component';
import {Response} from '../../../global/util/enum/Response';
import {StringUtil} from '../../../global/util/StringUtil';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ElectronicSignature} from '../../../global/util/ElectronicSignature';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css']
})
export class SignComponent implements OnInit {
  public signatureForm: FormGroup;
  public loading: boolean;
  private hashIdentifier;
  private personId: number;
  public document: Document;
  public person: Person;
  public wrongRequestPerson = true;
  public wrongRequestDocument = true;
  private title = 'Firma de documentos';
  public messageErrorRequest = '';
  public signCompleted = false;
  public urlStream;
  public resourceList: any[] = [];
  public loadingSign = false;
  public hasMultipleAttachments = false;
  public rubricSrc: string | ArrayBuffer;
  public previewRubricWidth = '80';
  public previewRubricHeight = '40';
  public realoadingPdf = false;

  constructor(private activatedRoute: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private personService: PersonService,
              private documentService: DocumentService,
              private signService: SignService,
              private modalService: NgbModal,
              private formBuilder: FormBuilder) {
    Dialog.createInstance(modalService);
    this.createForm();
    this.receiveParams();
  }

  public receiveParams() {
    this.activatedRoute.params.subscribe(params => {
      this.hashIdentifier = params.hashIdentifier;
      this.personId = +params.personId;
    });
  }

  ngOnInit() {
    this.loadPersonData(this.personId);
  }

  private loadPersonData(personId: number) {
    this.loading = true;
    const urlPerson = Constant.ROOT_API_V1.concat('/public/documents/')
      .concat(this.hashIdentifier)
      .concat('/people/').concat(String(personId));
    this.personService.get(urlPerson).subscribe((next: Person) => {
      this.loading = false;
      this.person = next;
      this.wrongRequestPerson = false;
      this.loadDocumentData(this.hashIdentifier);
    }, error => {
      this.loading = false;
      this.wrongRequestPerson = true;
      if (error.status) {
        if (HttpStatusCode.NOT_FOUND === error.status || HttpStatusCode.REQUEST_TIMEOUT === error.status) {
          this.messageErrorRequest = error.error.message;
        } else {
          Dialog.show(InformType.Danger, this.title);
        }
      }
    });
  }

  private loadDocumentData(hashIdentifier: string) {
    this.loading = true;
    const urlDocument = Constant.ROOT_API_V1.concat('/public/people/', String(this.personId), '/hashIdentifier/', hashIdentifier, '/documents');
    this.personService.get(urlDocument).subscribe((next: Document) => {
      this.loading = false;
      this.document = next;
      this.resourceList = this.document._more.resources;
      this.hasMultipleAttachments = this.document._more.resources.length > 1;
      this.urlStream = this.document._more.resources[0].url;
      this.wrongRequestDocument = false;
    }, error => {
      this.loading = false;
      this.wrongRequestDocument = true;
      Dialog.show(InformType.Danger, this.title);
    });
  }

  public getUrlSign(document: any): SafeUrl {
    if (this.hasMultipleAttachments) {
      return;
    }
    const urlFrom = DocumentUtil.buildUrlDownload(document);
    const urlTo = DocumentUtil.buildUrlUpload(document, this.personId);
    return this.sanitizer.bypassSecurityTrustResourceUrl('rsign:?from='
      .concat(urlFrom)
      .concat('&to=')
      .concat(urlTo));
  }

  public signBatchBy(document: any) {
    const identifiers = document.id;
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
            this.signCompleted = true;
            Dialog.show(InformType.Success, this.title);
            clearInterval(interval);
            this.loadingSign = false;
          }
        }, error => {
          Dialog.show(InformType.Danger, this.title);
        });
      }, 3000);
    }, error => {
      Dialog.show(InformType.Danger, this.title);
    });
  }

  get getUrlStream() {
    return this.urlStream;
  }

  // TODO correct pass parameters, services shouldn't build urls
  public checkStatusOne2One(document: any) {
    const urlOne2One = Constant.ROOT_API_V1.concat('/public/signs/one2one/status')
      .concat('?personId=')
      .concat(String(this.personId))
      .concat('&documentId=')
      .concat(document.id);
    this.loading = true;
    const interval = setInterval(() => {
      this.documentService.get(urlOne2One).subscribe((next: any) => {
        if (next.completed === Constant.FINISHED) {
          this.signCompleted = true;
          Dialog.show(InformType.Success, this.title);
          clearInterval(interval);
          this.loading = false;
        }
      }, error => {
        Dialog.show(InformType.Danger, this.title);
      });
    }, 2000);
  }

  public onProgress(progressData: PDFProgressData) {
    this.loading = true;
  }

  public progressCompleted(pdf: PDFDocumentProxy) {
    this.loading = false;
  }

  get isInvited(): boolean {
    return Constant.INVITED === this.person._more.participantType;
  }

  public setUrlDoc(resource: any) {
    this.urlStream = resource.url;
  }

  public opensignElectronicallyModal(document: Document) {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.title = 'Firmar documento';
    modalRef.componentInstance.body = '¿Proceder con la firma del documento?';
    modalRef.result.then(value => {
      if (Response.Yes === value) {
        const documents: Document[] = [document];
        this.signElectronically(documents);
      }
    });
  }

  public signElectronically(documents: Document[]) {
    this.loading = true;
    const url = Constant.ROOT_API_V1.concat('/public/people/', String(this.personId), '/suboperationtype/', String(ElectronicSignature.GRAPHIC_SIGNATURE), '/documents/sign?uuid=', this.document._more.uuid);
    this.documentService.signElectronically(url, documents).subscribe(value => {
      this.loading = false;
      this.signCompleted = true;
      Dialog.show(InformType.Success, this.title);
    }, error => {
      this.loading = false;
      this.signCompleted = false;
      Dialog.show(InformType.Danger, this.title);
    });
  }

  public openModalSignDocumentInternal2(documents: Document[]) {
    const modalRef = this.modalService.open(SignDocumentInternalComponent, {
      backdrop: 'static',
      size: 'xl'
    });
    modalRef.componentInstance.documents = documents;
  }

  get digitalSignature(): boolean {
    return this.document._more.digitalSignature;
  }

  get electronicSignature(): boolean {
    return !this.document._more.digitalSignature;
  }

  public readSelectedRubric(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.rubricSrc = reader.result;
      reader.readAsDataURL(file);
    }
  }

  public changeStatus(event: any) {
    const testFile = event[Constant.ZERO_INDEX];
    this.signatureForm.patchValue({
      rubricFileBase64: testFile.base64,
      rubricFilename: testFile.name,
      rubricFilename2Show: StringUtil.cut(testFile.name, 42, 'Seleccione...'),
    });
    this.updateValueAndValidityRubricFields();
  }

  private updateValueAndValidityRubricFields() {
    this.signatureForm.get('rubricFileBase64').updateValueAndValidity();
    this.signatureForm.get('rubricFilename').updateValueAndValidity();
    this.signatureForm.get('rubricFilename2Show').updateValueAndValidity();
  }

  get defaultRubricSrc(): string | ArrayBuffer {
    return this.rubricSrc || this.placeHoldItRubric;
  }

  get placeHoldItRubric(): string {
    return 'http://placehold.it/' + this.previewRubricWidth + 'x' + this.previewRubricHeight;
  }

  public createForm() {
    this.signatureForm = this.formBuilder.group(
      {
        rubricFileId: [''],
        rubricFileBase64: [''],
        rubricFilename: [''],
        rubricFilename2Show: [''],
      });
  }

  get styleDimensionsRubric(): string {
    return 'width: ' + this.previewRubricWidth + 'px; height: auto';
  }

  public updateRubric(): void {
    this.realoadingPdf = true;
    const rubricFileBase64: string = this.signatureForm.get('rubricFileBase64').value;
    const rubricFilename: string = this.signatureForm.get('rubricFilename').value;
    const url = Constant.ROOT_API_V1.concat('/public/people/', String(this.personId), '/rubric?uuid=', this.document._more.uuid);
    this.personService.updateRubric(url, rubricFileBase64, rubricFilename).subscribe(value => {
      this.realoadingPdf = false;
    }, error => {
      this.realoadingPdf = false;
      Dialog.show(InformType.Danger, 'Actualización de rúbrica');
    });
  }

  get disabledUpdateButton(): boolean {
    return this.signatureForm.get('rubricFileBase64').value === '';
  }

  get hasConfigRubric() {
    return this.document._more.hasRubricSettings;
  }
}
