import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Enterprise} from '../../../model/Enterprise';
import {Constant} from '../../../../global/util/Constant';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {JobService} from '../../../service/job.service';
import {AuthService} from '../../../service/auth/auth.service';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {Siecredential} from '../../../model/Siecredential';
import {SieCredentialService} from '../../../service/sie-credential.service';
import {InformType} from '../../../../global/util/enum/InformType';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {ApplicationService} from '../../../service/application.service';
import {Router} from '@angular/router';
import {Dialog} from '../../../../global/util/Dialog';
import {Partner} from '../../../model/Partner';

@Component({
  selector: 'app-add-sie-credential',
  templateUrl: './add-sie-credential.component.html',
  styleUrls: ['./add-sie-credential.component.css']
})
export class AddSieCredentialComponent implements OnInit {
  public siecredential: Siecredential;
  public title = 'Credenciales';
  public loading: boolean;
  public siecredentialForm: FormGroup;
  public enterprises: Enterprise[] = [];
  public partners: Partner[] = [];
  public partnerSelected: Partner;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;

  constructor(public activeModal: NgbActiveModal,
              private modalService: NgbModal,
              private formBuilder: FormBuilder,
              private jobService: JobService,
              private authenticationService: AuthService,
              private sieCredentialService: SieCredentialService,
              private applicationService: ApplicationService,
              private router: Router) {
    Dialog.createInstance(modalService);
    this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.setDefaultData();
  }

  private loadInitialData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partners = LocalStorage.getPartners();
    } else if (this.hasRole(this.ROLE_PARTNER)) {
      this.enterprises = LocalStorage.getEnterprises();
    }
  }

  private setDefaultData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partnerSelected = this.partners[Constant.ZERO_INDEX];
      this.enterprises = this.getEnterprises(this.partnerSelected.id);
    }
    if (this.hasRole(this.ROLE_SUPERADMIN) || this.hasRole(this.ROLE_PARTNER)) {
      if (this.isNewSiecredential) {
        this.siecredential.enterpriseId = this.enterprises[Constant.ZERO_INDEX].id;
      } else {
        this.siecredential.enterpriseId = this.enterprises.find(enterprise => this.siecredential.enterpriseId === enterprise.id).id;
      }
    }
    this.loadUsername();
  }

  public save(): void {
    if (this.siecredentialForm.invalid) {
      Object.values(this.siecredentialForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.loading = true;
    this.setValueBefore2Save();
    if (this.isNewSiecredential) {
      this.register();
    }
  }

  public cancel(): void {
    this.activeModal.close();
  }

  public register() {
    const url = Constant.ROOT_API_V1.concat('/siecredential');
    const formData = new FormData();
    formData.append('enterpriseId', String(this.siecredential.enterpriseId));
    formData.append('usernameSie', this.siecredentialForm.value.usernameSie);
    formData.append('passwordSie', this.siecredentialForm.value.passwordSie);
    formData.append('certificate', this.siecredentialForm.value.certificate);
    formData.append('passwordCertificate', this.siecredentialForm.value.passwordCertificate);

    this.sieCredentialService.save(url, formData).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.processError(error);
    });
  }

  private setValueBefore2Save() {
    if (!this.hasRole(this.ROLE_SUPERADMIN) && !this.hasRole(this.ROLE_PARTNER)) {
      this.siecredential.enterpriseId = LocalStorage.getEnterpriseIdView();
    }
  }

  get isNewSiecredential(): boolean {
    return this.siecredential.id === undefined;
  }

  private createForm() {
    this.siecredentialForm = this.formBuilder.group(
      {
        partner: [],
        enterprise: [],
        usernameSie: ['', [Validators.required]],
        passwordSie: ['', [Validators.required]],
        certificate: [null, [Validators.required]],
        certificateName: [''],
        passwordCertificate: ['', [Validators.required]],
        status: ['']
      });
  }

  public isInvalidControl(ctrlName: string) {
    return this.siecredentialForm.get(ctrlName).invalid && this.siecredentialForm.get(ctrlName).touched;
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  public changeStatus(event) {
    const fileSelected = (event.target as HTMLInputElement).files[0];
    this.siecredentialForm.patchValue({
      certificate: fileSelected,
      certificateName: fileSelected.name
    });
    this.siecredentialForm.get('certificate').updateValueAndValidity();
  }

  public loadUsername() {
    let documentNumber;
    if (this.hasRole(this.ROLE_SUPERADMIN) || this.hasRole(this.ROLE_PARTNER)) {
      documentNumber = this.enterprises.find(value => value.id === this.siecredential.enterpriseId).documentNumber;
    } else {
      documentNumber = LocalStorage.getEnterpriseDocumentNumberView();
    }
    const address = this.buildAddressBy(documentNumber);
    this.siecredentialForm.get('usernameSie').setValue(address);
  }

  private buildAddressBy(documentNumber: string): string {
    return 'ruc_'.concat(documentNumber).concat('@v2.midomicilio.pe');
  }

  private processError(error: any) {
    const status = error.status;
    if (status) {
      if (HttpStatusCode.UNAUTHORIZED === status) {
        Dialog.show(InformType.Danger, this.title, error.error.message);
      } else if (HttpStatusCode.FORBIDDEN === status) {
        Dialog.show(InformType.Info, 'Sesión expirada', 'Su sesión expiró y fue cerrada automáticamente. Por favor inicie sesión nuevamente.');
        this.logout();
      } else if (HttpStatusCode.BAD_REQUEST === status) {
        this.activeModal.close(InformType.Anything);
        Dialog.show(InformType.Danger, this.title, error.error.message);
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

  public reloadEnterprises() {
    this.enterprises = this.getEnterprises(this.partnerSelected.id);
    if (this.isNewSiecredential) {
      this.siecredential.enterpriseId = this.enterprises[Constant.ZERO_INDEX].id;
    }
  }

  private getEnterprises(partnerId: number): Enterprise[] {
    return LocalStorage.getEnterprises().filter(value => partnerId === value.partnerId && Constant.NOT_EXCLUDED === value.excluded);
  }
}
