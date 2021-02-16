import {Component, OnInit} from '@angular/core';
import {Contentdeliverymail} from '../../../model/Contentdeliverymail';
import {DocumentService} from '../../../service/document.service';
import {InformType} from '../../../../global/util/enum/InformType';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Constant} from '../../../../global/util/Constant';
import {Document} from '../../../model/Document';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {Dialog} from '../../../../global/util/Dialog';
import {ApplicationService} from '../../../service/application.service';
import {Router} from '@angular/router';
import {Mailtemplate} from '../../../model/Mailtemplate';

@Component({
  selector: 'app-send-to-email',
  templateUrl: './send-to-email.component.html',
  styleUrls: ['./send-to-email.component.css']
})
export class SendToEmailComponent implements OnInit {

  public sendEmailForm: FormGroup;
  public document: Document;
  public contentdeliverymail = new Contentdeliverymail();
  public loading: boolean;
  public title = 'Envío por correo';
  public mailtemplate: Mailtemplate;

  constructor(private documentService: DocumentService,
              private modalService: NgbModal,
              private formBuilder: FormBuilder,
              public activeModal: NgbActiveModal,
              private applicationService: ApplicationService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.createForm();
    this.loadInitialData();
    this.setInitialValues();
  }

  private createForm() {
    this.sendEmailForm = this.formBuilder.group(
      {
        arrayToRecipients: this.formBuilder.array([]),
        arrayCcRecipients: this.formBuilder.array([]),
        subject: ['', [Validators.required]],
        attachFiles: [''],
        body: ['', [Validators.required]],
      });
    this.addToRow();
    this.addCcRow();
  }

  private loadInitialData() {
    if (this.mailtemplate !== null) {
      this.contentdeliverymail.subject = this.mailtemplate.subject;
      this.contentdeliverymail.body = this.mailtemplate.body;
    } else {
      this.contentdeliverymail.subject = this.document.subject;
      this.contentdeliverymail.body = this.document.subject;
    }
  }

  private setInitialValues() {
    if (this.isLengthMoreThan5MB) {
      this.contentdeliverymail.attachFiles = false;
    } else {
      this.contentdeliverymail.attachFiles = true;
    }
  }

  public send(): void {
    if (this.sendEmailForm.invalid) {
      Object.values(this.sendEmailForm.controls).forEach(control => {
        control.markAsTouched();
      });
      for (const group of this.arrayToRecipients.controls) {
        group.get('to').markAsTouched();
      }
      for (const group of this.arrayCcRecipients.controls) {
        group.get('cc').markAsTouched();
      }
      return;
    }
    let to = '';
    let cc = '';
    for (const group of this.arrayToRecipients.controls) {
      if (group instanceof FormGroup) {
        to += group.value.to + ';';
      }
    }
    for (const group of this.arrayCcRecipients.controls) {
      if (group instanceof FormGroup) {
        if (group.value.cc && group.value.cc !== '') {
          cc += group.value.cc + ';';
        }
      }
    }
    cc = cc === '' ? undefined : cc;
    this.contentdeliverymail.recipient = to;
    this.contentdeliverymail.cc = cc;
    this.loading = true;
    const url = Constant.ROOT_API_V1 + '/documents/' + this.document.id + '/contentdeliverymail';
    this.documentService.send2Email(url, this.contentdeliverymail).subscribe(value => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
      Dialog.show(InformType.Success, this.title);
    }, error => {
      this.loading = false;
      this.processError(this.title, error);
    });
  }

  public cancel(): void {
    this.activeModal.close();
  }

  private processError(title: string, error: any) {
    const status = error.status;
    if (status) {
      if (HttpStatusCode.UNAUTHORIZED === status) {
        Dialog.show(InformType.Danger, title, error.error.message);
      } else if (HttpStatusCode.FORBIDDEN === status) {
        Dialog.show(InformType.Info, 'Sesión expirada', 'Su sesión expiró y fue cerrada automáticamente. Por favor inicie sesión nuevamente.');
        this.logout();
      } else if (HttpStatusCode.NOT_IMPLEMENTED === status) {
        Dialog.show(InformType.Danger, title, error.error.message);
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

  public isInvalidControl(ctrlName: string) {
    return this.sendEmailForm.get(ctrlName).invalid && this.sendEmailForm.get(ctrlName).touched;
  }

  public isInvalidControl2(formArray: FormArray, index: number, ctrlName: string) {
    const control = formArray.at(index).get(ctrlName);
    return control.invalid && control.touched;
  }

  get totalLengthDocument(): number {
    let totalLength = 0;
    this.document._more.resources.forEach(resource => totalLength += resource.length);
    return totalLength;
  }

  get totalLengthOnMB(): number {
    const KB = 1024;
    const MB = 1024;
    return +(this.totalLengthDocument / KB / MB).toFixed(2);
  }

  get isLengthMoreThan5MB(): boolean {
    return this.totalLengthOnMB > 5;
  }

  get arrayToRecipients() {
    return this.sendEmailForm.get('arrayToRecipients') as FormArray;
  }

  public deleteToRow(index: number) {
    this.arrayToRecipients.removeAt(index);
  }

  get hasUniqueToRow(): boolean {
    return this.arrayToRecipients.controls.length === 1;
  }

  public addToRow() {
    const group = this.formBuilder.group({
      to: ['', [Validators.required]]
    });
    this.arrayToRecipients.push(group);
  }

  get arrayCcRecipients() {
    return this.sendEmailForm.get('arrayCcRecipients') as FormArray;
  }

  public deleteCcRow(index: number) {
    this.arrayCcRecipients.removeAt(index);
  }

  get hasUniqueCcRow(): boolean {
    return this.arrayCcRecipients.controls.length === 1;
  }

  public addCcRow() {
    const group = this.formBuilder.group({
      cc: ['']
    });
    this.arrayCcRecipients.push(group);
  }

  public getErrorMessageBy(formArray: FormArray, index: number, controlname: string): string {
    const control = formArray.at(index).get(controlname);
    const hasRequiredError = control.hasError('required');
    const hasEmailError = control.hasError('email');
    switch (controlname) {
      case 'to':
      case 'cc':
        if (hasRequiredError) {
          return 'Debe ingresar el correo electrónico del destinatario';
        } else if (hasEmailError) {
          return '\'' + control.value + '\' no es un correo electrónico válido';
        }
        break;
    }
  }
}
