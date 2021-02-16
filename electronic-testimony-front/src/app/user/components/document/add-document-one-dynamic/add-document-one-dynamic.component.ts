import {Component, OnInit} from '@angular/core';
import {InformType} from '../../../../global/util/enum/InformType';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DocumentService} from '../../../service/document.service';
import {Workflow} from '../../../model/Workflow';
import {Document} from '../../../model/Document';
import {PersonService} from '../../../service/person.service';
import {Person} from '../../../model/Person';
import {Constant} from '../../../../global/util/Constant';
import {HttpEvent, HttpEventType} from '@angular/common/http';
import {DocumentUtil} from '../../../../global/util/DocumentUtil';
import {SignType} from '../../../../global/util/enum/SignType';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {AddEditPersonComponent} from '../../person/add-edit-person/add-edit-person.component';
import {AuthService} from '../../../service/auth/auth.service';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {Router} from '@angular/router';
import {ApplicationService} from '../../../service/application.service';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-add-document-one-dynamic',
  templateUrl: './add-document-one-dynamic.component.html',
  styleUrls: ['./add-document-one-dynamic.component.css']
})
export class AddDocumentOneDynamicComponent implements OnInit {
  public loading: boolean;
  public documentForm: FormGroup;
  public document = new Document();
  public workflows: Workflow[] = [];
  public workflowSelected = new Workflow();
  public people: Person[] = [];
  public progressUpdate = 0;
  public enterpriseIdSelected: number;
  public uploading = false;
  private type = 1;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public ROLE_USER = Constant.ROLE_USER;
  public title = 'Firmar dinámicamente';

  constructor(public activeModal: NgbActiveModal,
              private modalService: NgbModal,
              private formBuilder: FormBuilder,
              public documentService: DocumentService,
              public personService: PersonService,
              private router: Router,
              public authenticationService: AuthService,
              private applicationService: ApplicationService) {
    Dialog.createInstance(modalService);
    this.createForm();
  }

  ngOnInit() {
    if (this.hasRole(this.ROLE_SUPERADMIN) || this.hasRole(this.ROLE_ADMIN)) {
      this.workflows = LocalStorage.getWorkflows(this.enterpriseIdSelected);
    } else {
      this.workflows = LocalStorage.getWorkflowsByPerson();
    }
    // TODO Investigate and improvement pass values by reference and avoid a return of this.workflows
    this.workflows = DocumentUtil.extractOnlyNecesaryWorkflowsBy(this.workflows, SignType.Dynamic);
    this.workflowSelected = this.workflows[0];
    const interval = setInterval(() => {
      if (!this.authenticationService.isAuthenticated()) {
        clearInterval(interval);
        this.activeModal.close(InformType.Anything);
      }
    }, 300);
  }

  public isEditable(index: number): boolean {
    const group = this.arrayParticipant.at(index);
    return  Constant.INVITED === group.get('participantType').value;
  }

  public openAddSearchPerson(index: number) {
    const group = this.arrayParticipant.at(index);
    const person = new Person();
    const modalRef = this.modalService.open(AddEditPersonComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.personReceived = new Person();
    modalRef.componentInstance.purpose4Form = Constant.ADD_ON_DOCS;
    modalRef.componentInstance.enterpriseIdSelected = LocalStorage.getEnterpriseIdView();
    modalRef.result.then((result) => {
      if (result === -1) {
        return;
      }
      group.get('id').setValue(result.id);
      group.get('documentNumber').setValue(result.documentNumber);
      group.get('fullname').setValue(result.fullname);
      group.get('replaceable').setValue(result.replaceable);
      group.get('replaced').setValue(Constant.REPLACED);
      if (InformType.Warning === result) {
        Dialog.show(InformType.Warning, 'Persona');
      } else if (InformType.Success === result) {
        Dialog.show(InformType.Success, 'Persona');
      } else if (InformType.Info === result) {
        Dialog.show(InformType.Info, 'Persona');
      }
    });
  }

  public save(): void {
    if (this.documentForm.invalid) {
      Object.values(this.documentForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    const replacements = this.getReplacementsOf();
    const formData = new FormData();
    formData.append('type', String(this.type));
    formData.append('subject', this.document.subject);
    formData.append('workflowId', String(this.workflowSelected.id));
    formData.append('replacements', replacements);
    for (const doc of this.arrayDocument.controls) {
      formData.append('files', doc.value.file);
    }
    this.documentService.upload(formData).subscribe((event: HttpEvent<any>) => {
      this.uploading = true;
      switch (event.type) {
        case HttpEventType.Sent:
          // TODO When request has been made
          break;
        case HttpEventType.ResponseHeader:
          // TODO When response header has been received
          break;
        case HttpEventType.UploadProgress:
          this.progressUpdate = Math.round(event.loaded / event.total * 100);
          break;
        case HttpEventType.Response:
          this.uploading = false;
          this.activeModal.close(InformType.Success);
          break;
      }
    }, error => {
      this.progressUpdate = 0;
      this.processError(error);
    });
  }

  private getReplacementsOf(): string {
    let replacements = '';
    // tslint:disable-next-line:prefer-for-of
    for (let index = 0; index < this.arrayParticipant.length; index++) {
      const group = this.arrayParticipant.at(index);
      const participantType = group.get('participantType').value;
      const personId = group.get('id').value;
      const tsa = group.get('tsa').value ? '1' : '0';
      if (Constant.INVITED === participantType) {
        replacements += String(index + 1)
          .concat(',')
          .concat(personId)
          .concat(',')
          .concat(tsa)
          .concat('|');
      }
    }
    const lastIndexOf = replacements.lastIndexOf('|');
    return replacements.substring(0, lastIndexOf);
  }

  cancel(): void {
    // TODO Investigate how to cancel upload request correctly
    this.activeModal.close();
  }

  private createForm() {
    this.documentForm = this.formBuilder.group(
      {
        workflow: [''],
        subject: ['', [Validators.required]],
        arrayDocument: this.formBuilder.array([]),
        arrayParticipant: this.formBuilder.array([])
      });
    this.addRow();
    this.addRowParticipant();
  }

  public isInvalidControl(ctrlName: string) {
    return this.documentForm.get(ctrlName).invalid && this.documentForm.get(ctrlName).touched;
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
    group.get('file').updateValueAndValidity();
  }

  get areValidPeople() {
    return !(this.people.find(person => Constant.NOT_REPLACED === person.replaced) !== undefined);
  }

  get arrayDocument() {
    return this.documentForm.get('arrayDocument') as FormArray;
  }


  get arrayParticipant() {
    return this.documentForm.get('arrayParticipant') as FormArray;
  }

  public addRow() {
    const group = this.formBuilder.group({
      file: [null, [Validators.required]],
      filename: [''],
      workflow: [this.workflowSelected]
    });
    this.arrayDocument.push(group);
  }

  public addRowParticipant() {
    const group = this.formBuilder.group({
      id: [],
      documentNumber: ['00000000'],
      fullname: ['PENDIENTE'],
      tsa: [''],
      replaceable: [Constant.REPLACEABLE],
      participantType: [Constant.INVITED],
      replaced: [],
    });
    this.arrayParticipant.push(group);
  }

  public deleteRow(index: number) {
    this.arrayDocument.removeAt(index);
  }

  public deleteParticipantRow(index: number) {
    this.arrayParticipant.removeAt(index);
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
