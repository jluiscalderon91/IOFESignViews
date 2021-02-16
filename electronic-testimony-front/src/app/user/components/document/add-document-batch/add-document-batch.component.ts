import {Component, OnInit} from '@angular/core';
import {InformType} from '../../../../global/util/enum/InformType';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DocumentService} from '../../../service/document.service';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {Workflow} from '../../../model/Workflow';
import {DocumentUtil} from '../../../../global/util/DocumentUtil';
import {SignType} from '../../../../global/util/enum/SignType';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {Constant} from '../../../../global/util/Constant';
import {AuthService} from '../../../service/auth/auth.service';
import {Router} from '@angular/router';
import {ApplicationService} from '../../../service/application.service';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-add-document-batch',
  templateUrl: './add-document-batch.component.html',
  styleUrls: ['./add-document-batch.component.css']
})
export class AddDocumentBatchComponent implements OnInit {
  public loading: boolean;
  public documentForm: FormGroup;
  private arrayProgress: number[] = [];
  private type = 1;
  public fileSelected: boolean;
  public workflows: Workflow[] = [];
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public enterpriseIdSelected: number;
  public title = 'Agregar documento en lote';

  constructor(private activeModal: NgbActiveModal,
              private formBuilder: FormBuilder,
              public documentService: DocumentService,
              public authenticationService: AuthService,
              private modalService: NgbModal,
              private router: Router,
              private applicationService: ApplicationService) {
    Dialog.createInstance(modalService);
  }

  ngOnInit() {
    if (this.hasRole(this.ROLE_SUPERADMIN) || this.hasRole(this.ROLE_ADMIN)) {
      this.workflows = LocalStorage.getWorkflows(this.enterpriseIdSelected);
    } else {
      this.workflows = LocalStorage.getWorkflowsByPerson();
    }
    // TODO Investigate and improvement pass values by reference and avoid a return of this.workflows
    this.workflows = DocumentUtil.extractOnlyNecesaryWorkflowsBy(this.workflows, SignType.Batch);
    this.createForm();
    const interval = setInterval(() => {
      if (!this.authenticationService.isAuthenticated()) {
        clearInterval(interval);
        this.activeModal.close(InformType.Anything);
      }
    }, 300);
  }

  save(): void {
    if (this.documentForm.invalid) {
      Object.values(this.documentForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    for (let index = 0; index < this.arrayDocument.controls.length; index++) {
      const group = this.arrayDocument.controls[index];
      if (group instanceof FormGroup) {
        const formData = new FormData();
        formData.append('type', String(this.type));
        formData.append('subject', group.value.subject);
        formData.append('files', group.value.file);
        formData.append('workflowId', group.value.workflow.id);
        formData.append('replacements', '');
        this.documentService.upload(formData).subscribe((event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Sent:
              // TODO When request has been made
              break;
            case HttpEventType.ResponseHeader:
              // TODO When response header has been received
              break;
            case HttpEventType.UploadProgress:
              this.arrayProgress[index] = Math.round(event.loaded / event.total * 100);
              break;
            case HttpEventType.Response:
              // TODO When upload file was successfull
              break;
          }
        }, error => {
          if (error.status === HttpStatusCode.NOT_FOUND) {
            this.processError(error);
          }
        });
      }
    }
    const interval = setInterval(() => {
      this.loading = true;
      let complete = true;
      for (const progress of this.arrayProgress) {
        if (progress !== 100) {
          complete = false;
        }
      }
      if (complete) {
        this.activeModal.close(InformType.Success);
        clearInterval(interval);
        this.loading = false;
      }
    }, 300);
  }

  cancel(): void {
    this.activeModal.close();
  }

  private createForm() {
    this.documentForm = this.formBuilder.group(
      {
        arrayDocument: this.formBuilder.array([])
      });
    this.addRow();
  }

  get arrayDocument() {
    return this.documentForm.get('arrayDocument') as FormArray;
  }

  public isInvalidControl(ctrlName: string) {
    return this.documentForm.get(ctrlName).invalid && this.documentForm.get(ctrlName).touched;
  }

  public addRow() {
    const group = this.formBuilder.group({
      subject: ['', [Validators.required]],
      file: [null, [Validators.required]],
      filename: [''],
      workflow: [this.workflows[0]]
    });
    this.arrayDocument.push(group);
    this.arrayProgress.push(0);
  }

  public deleteRow(index: number) {
    this.arrayDocument.removeAt(index);
    this.arrayProgress.splice(index, 1);
  }

  public getProgress(index: number): number {
    return this.arrayProgress[index];
  }

  public changeStatus(event, index: number) {
    const fileSelected = (event.target as HTMLInputElement).files[0];
    if (!fileSelected.name.endsWith('.pdf')) {
      Dialog.show(InformType.Warning, this.title, 'Usted seleccionó un tipo de archivo no permitido');
      return;
    }
    const group = this.arrayDocument.at(index);
    group.patchValue({
      file: fileSelected,
      filename: fileSelected.name
    });
    this.fileSelected = group.get('filename').value;
    group.get('file').updateValueAndValidity();
  }

  get hideDeleteItemOnlyRecord() {
    return this.arrayDocument.length === 1;
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
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
