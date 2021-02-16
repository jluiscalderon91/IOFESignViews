import {Component, OnInit} from '@angular/core';
import {InformType} from '../../../../global/util/enum/InformType';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DocumentService} from '../../../service/document.service';
import {Constant} from '../../../../global/util/Constant';
import {PDFDocumentProxy, PDFProgressData} from 'pdfjs-dist';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {ApplicationService} from '../../../service/application.service';
import {Router} from '@angular/router';
import {AuthService} from '../../../service/auth/auth.service';
import {ReviewType} from '../../../../global/util/enum/ReviewType';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-review-document',
  templateUrl: './review-document.component.html',
  styleUrls: ['./review-document.component.css']
})
export class ReviewDocumentComponent implements OnInit {
  public loading: boolean;
  public document: any;
  public documents: any [];
  public reviewForm: FormGroup;
  public urlStream;
  public personId;
  public resourceList: any[] = [];
  public hasMultipleAttachments;
  public title = 'Revisión de documentos';
  public reviewType: number;
  private reviewInfos: any[];

  constructor(private activeModal: NgbActiveModal,
              private modalService: NgbModal,
              private formBuilder: FormBuilder,
              private documentService: DocumentService,
              private applicationService: ApplicationService,
              private router: Router,
              private authenticationService: AuthService) {
    Dialog.createInstance(modalService);
    this.createForm();
  }

  ngOnInit() {
    this.createEntities();
    this.document = this.documents[0];
    if (ReviewType.One2One === this.reviewType) {
      this.hasMultipleAttachments = this.document._more.resources.length > 1;
    } else if (ReviewType.Batch === this.reviewType) {
      this.hasMultipleAttachments = this.documents.find(value => value._more.resources.length > 1) !== undefined;
    }
    this.reloadResourceList();
    const interval = setInterval(() => {
      if (!this.authenticationService.isAuthenticated()) {
        clearInterval(interval);
        this.activeModal.close(InformType.Anything);
      }
    }, 300);

  }

  private createForm() {
    this.reviewForm = this.formBuilder.group(
      {
        observed: new FormControl(''),
        cancelled: new FormControl(''),
        comment: new FormControl('')
      });
  }

  private applyValidators() {
    const reviewInfo = this.getReviewInfoBy(this.document);
    if (reviewInfo.observed || reviewInfo.cancelled) {
      this.reviewForm.get('comment').setValidators(Validators.required);
      this.reviewForm.get('comment').updateValueAndValidity();
    } else if (!reviewInfo.observed && !reviewInfo.cancelled) {
      this.reviewForm.get('comment').clearValidators();
      this.reviewForm.get('comment').updateValueAndValidity();
    }
  }

  public changeObserved(event) {
    const reviewInfo: ReviewInfo = this.getReviewInfoBy(this.document);
    if (event.target.checked) {
      reviewInfo.observed = true;
      if (reviewInfo.cancelled) {
        reviewInfo.cancelled = false;
      }
    } else {
      reviewInfo.observed = false;
    }
    this.applyValidators();
  }

  public changeCancelled(event) {
    const reviewInfo: ReviewInfo = this.getReviewInfoBy(this.document);
    if (event.target.checked) {
      reviewInfo.cancelled = true;
      if (reviewInfo.observed) {
        reviewInfo.observed = false;
      }
    } else {
      reviewInfo.cancelled = false;
    }
    this.applyValidators();
  }

  private buildUrlSource() {
    this.urlStream = this.document._more.resources[0].url;
  }

  public onProgress(progressData: PDFProgressData) {
    this.loading = true;
  }

  public progressCompleted(pdf: PDFDocumentProxy) {
    this.loading = false;
  }

  public isInvalidControl(ctrlName: string) {
    return this.reviewForm.get(ctrlName).invalid && this.reviewForm.get(ctrlName).touched;
  }

  public save(): void {
    if (this.reviewForm.invalid) {
      Object.values(this.reviewForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    const reviewInfo = this.reviewInfos.find(value =>
      (value.observed && (value.comment === undefined || value.comment === '')) ||
      (value.cancelled && (value.comment === undefined || value.comment === ''))
    );
    if (reviewInfo) {
      const document = this.documents.find(value => reviewInfo.documentId === value.id);
      const message = 'El documento \'' + document.subject + '\' requiere el ingreso de sus comentarios/observaciones.';
      Dialog.show(InformType.Warning, this.title, message);
      return;
    }
    this.loading = true;
    if (this.hasUniqueDocument) {
      this.reviewOne2One();
    } else {
      this.reviewBatch();
    }
  }

  private reviewOne2One() {
    const url = Constant.ROOT_API_V1.concat('/documents/')
      .concat(String(this.document.id))
      .concat('/')
      .concat(this.document.hashIdentifier)
      .concat('/people/')
      .concat(String(this.personId))
      .concat('/review');
    const formData = new FormData();
    formData.append('observed', String(this.reviewForm.value.observed ? 1 : 0));
    formData.append('cancelled', String(this.reviewForm.value.cancelled ? 1 : 0));
    formData.append('comment', this.reviewForm.value.comment);
    this.documentService.reviewOne2One(url, formData).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.processError(error);
    });
  }

  private reviewBatch() {
    this.setValuesBefore2Save();
    const url = Constant.ROOT_API_V1.concat('/people/', String(this.personId), '/documents/review');
    const revision = new Revision();
    revision.reviewInfos = this.reviewInfos;
    this.documentService.reviewBatch(url, revision).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.processError(error);
    });
  }

  private setValuesBefore2Save() {
    this.reviewInfos.forEach(value => {
      if (value.observed) {
        value.observed = 1;
      } else {
        value.observed = 0;
      }
      if (value.cancelled) {
        value.cancelled = 1;
      } else {
        value.cancelled = 0;
      }
    });
  }

  public cancel(): void {
    this.activeModal.close();
  }

  public setUrlDoc(resource: any) {
    this.loading = true;
    this.urlStream = resource.url;
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

  public reloadResourceList() {
    this.resourceList = this.document._more.resources;
    this.buildUrlSource();
    this.applyValidators();
  }

  private createEntities() {
    this.reviewInfos = this.documents.map(value => {
      const reviewInfo: ReviewInfo = {
        documentId: value.id,
        hashIdentifier: value.hashIdentifier,
        observed: false,
        cancelled: false,
        comment: ''
      };
      return reviewInfo;
    });
  }

  private getReviewInfoBy(document: any) {
    return this.reviewInfos.find(value => document.id === value.documentId);
  }

  public keyupComment(event) {
    if (event.target) {
      const reviewInfo: ReviewInfo = this.getReviewInfoBy(this.document);
      reviewInfo.comment = event.target.value;
    }
  }

  get hasUniqueDocument(): boolean {
    return this.documents.length === 1;
  }

  public getObservedCheckedBy(document: any): boolean {
    const reviewInfo: ReviewInfo = this.getReviewInfoBy(document);
    return reviewInfo.observed;
  }

  public getCancelledCheckedBy(document: any): boolean {
    const reviewInfo: ReviewInfo = this.getReviewInfoBy(document);
    return reviewInfo.cancelled;
  }

  public getCommentBy(document: any): string {
    const reviewInfo: ReviewInfo = this.getReviewInfoBy(document);
    return reviewInfo.comment;
  }
}

class ReviewInfo {
  documentId: number;
  hashIdentifier: string;
  observed: boolean;
  cancelled: boolean;
  comment: string;
}

export class Revision {
  reviewInfos: ReviewInfo[];
}
