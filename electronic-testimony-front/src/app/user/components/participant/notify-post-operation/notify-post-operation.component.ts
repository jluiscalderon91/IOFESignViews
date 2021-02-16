import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../service/auth/auth.service';
import {Constant} from '../../../../global/util/Constant';
import {Sieemail} from '../../../model/Sieemail';
import {Sierecipient} from '../../../model/Sierecipient';
import {SieemailService} from '../../../service/sieemail.service';
import {InformType} from '../../../../global/util/enum/InformType';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-notify-post-operation',
  templateUrl: './notify-post-operation.component.html',
  styleUrls: ['./notify-post-operation.component.css']
})
export class NotifyPostOperationComponent implements OnInit {

  public notifyPostOperationForm: FormGroup;
  public sieemailReceived: Sieemail;
  public participantIdReceived: number;
  public loading: boolean;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public ROLE_USER = Constant.ROLE_USER;

  constructor(public activeModal: NgbActiveModal,
              private formBuilder: FormBuilder,
              private authenticationService: AuthService,
              private sieemailService: SieemailService) {
  }

  ngOnInit() {
    this.createForm();
  }

  private setDefaultData() {
    this.loadRows();
  }

  private createForm() {
    this.notifyPostOperationForm = this.formBuilder.group(
      {
        arrayRecipients: this.formBuilder.array([]),
        subject: ['', [Validators.required]],
        body: ['', [Validators.required]],
      });
    if (this.isNewSieemail) {
      this.addRow();
    } else {
      this.loadRows();
    }
  }

  get arrayRecipients() {
    return this.notifyPostOperationForm.get('arrayRecipients') as FormArray;
  }

  public addRow() {
    const group = this.formBuilder.group({
      address: ['']
    });
    this.arrayRecipients.push(group);
  }

  get isNewSieemail() {
    return this.sieemailReceived.id === undefined;
  }

  public loadRows() {
    if (this.sieemailReceived.sierecipientsById) {
      for (const recipient of this.sieemailReceived.sierecipientsById) {
        const group = this.formBuilder.group({
          address: [recipient.address]
        });
        this.arrayRecipients.push(group);
      }
    }
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  public deleteRow(index: number) {
    this.arrayRecipients.removeAt(index);
  }

  get thereIsUniqueRow(): boolean {
    return this.arrayRecipients.controls.length === 1;
  }

  public save() {
    this.loading = true;
    this.setValuesBefore2Save();
    if (this.isNewSieemail) {
      this.register();
    } else {
      this.edit();
    }
  }

  public register() {
    this.sieemailService.save(this.sieemailReceived).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  public edit() {
    this.sieemailService.update(this.sieemailReceived).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  private setValuesBefore2Save() {
    const sierecipients: Sierecipient[] = [];
    for (const group of this.arrayRecipients.controls) {
      if (group instanceof FormGroup) {
        const sierecipient = new Sierecipient();
        sierecipient.address = group.value.address;
        sierecipients.push(sierecipient);
      }
    }
    this.sieemailReceived.sierecipientsById = sierecipients;
    this.sieemailReceived.participantId = this.participantIdReceived;
  }

  public cancel(): void {
    this.activeModal.close();
  }
}
