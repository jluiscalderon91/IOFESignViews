import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {InformType} from '../../../../global/util/enum/InformType';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EnterpriseService} from '../../../service/enterprise.service';
import {Enterprise} from '../../../model/Enterprise';
import {AuthService} from '../../../service/auth/auth.service';
import {Constant} from '../../../../global/util/Constant';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {Partner} from '../../../model/Partner';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';

@Component({
  selector: 'app-add-enterprise',
  templateUrl: './add-edit-enterprise.component.html',
  styleUrls: ['./add-edit-enterprise.component.css']
})
export class AddEditEnterpriseComponent implements OnInit {
  public enterprise: Enterprise;
  public loading: boolean;
  public enterpriseform: FormGroup;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public partners: Partner[];
  public isPartner: boolean;
  public enterprises: Enterprise[];

  constructor(public activeModal: NgbActiveModal,
              private formBuilder: FormBuilder,
              private enterpriseService: EnterpriseService,
              private authenticationService: AuthService) {
    this.createForm();
  }

  ngOnInit() {
    this.enterprise.documentType = '6';
    this.loadDefaultData();
    this.setDefaultData();
  }

  private loadDefaultData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partners = LocalStorage.getPartners();
    }
  }

  private setDefaultData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      if (this.isNewEnterprise) {
        this.enterprise.partnerId = this.partners[Constant.ZERO_INDEX].id;
      } else {
        this.isPartner = Constant.IS_PARTNER === this.enterprise.isPartner;
      }
    } else {
      this.enterprise.partnerId = LocalStorage.getPartnerId();
    }
  }

  public save(): void {
    if (this.enterpriseform.invalid) {
      Object.values(this.enterpriseform.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.setValuesBefore2Save();
    this.loading = true;
    if (this.isNewEnterprise) {
      if (this.existEnterprise) {
        this.activeModal.close(InformType.Warning);
        return;
      }
      this.register();
    } else {
      this.edit();
    }
  }

  private setValuesBefore2Save() {
    if (this.isPartner) {
      this.enterprise.isPartner = Constant.IS_PARTNER;
    } else {
      this.enterprise.isPartner = Constant.IS_NOT_PARTNER;
    }
    if (this.enterprise.isCustomer === undefined) {
      this.enterprise.isCustomer = false;
    }
  }

  get existEnterprise(): boolean {
    const partnerId = this.hasRole(this.ROLE_SUPERADMIN) ? this.enterprise.partnerId : LocalStorage.getPartnerId();
    return this.enterprises.find(enterprise => enterprise.partnerId === partnerId && enterprise.documentNumber === this.enterprise.documentNumber) !== undefined;
  }

  public cancel(): void {
    this.activeModal.close();
  }

  public register() {
    this.completeTradeName();
    const partnerId = this.hasRole(this.ROLE_SUPERADMIN) ? this.enterprise.partnerId : LocalStorage.getPartnerId();
    const url = Constant.ROOT_API_V1.concat('/partners/', partnerId, '/enterprises');
    this.enterpriseService.save(url, this.enterprise).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      if (error.status === HttpStatusCode.FOUND) {
        this.activeModal.close(InformType.Warning);
      } else {
        this.activeModal.close(InformType.Danger);
      }
    });
  }

  public edit() {
    this.enterpriseService.edit(this.enterprise).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  get isNewEnterprise(): boolean {
    return this.enterprise.id === undefined;
  }

  private createForm() {
    this.enterpriseform = this.formBuilder.group(
      {
        partner: [''],
        docType: ['', [Validators.required]],
        docNumber: ['', Validators.compose(
          [Validators.minLength(11),
            Validators.maxLength(11),
            Validators.required])],
        name: ['', [Validators.required]],
        tradeName: [''],
        isPartner: [''],
        isCustomer: ['']
      });
  }

  public isInvalidControl(ctrlName: string) {
    return this.enterpriseform.get(ctrlName).invalid && this.enterpriseform.get(ctrlName).touched;
  }

  private completeTradeName() {
    if (!this.enterprise.tradeName) {
      this.enterprise.tradeName = this.enterprise.name;
    }
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }
}
