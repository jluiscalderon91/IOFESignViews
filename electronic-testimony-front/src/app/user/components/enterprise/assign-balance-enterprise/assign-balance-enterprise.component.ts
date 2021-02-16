import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Enterprise} from '../../../model/Enterprise';
import {Constant} from '../../../../global/util/Constant';
import {Partner} from '../../../model/Partner';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../../service/auth/auth.service';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {InformType} from '../../../../global/util/enum/InformType';
import {Headbalanceallocation} from '../../../model/Headbalanceallocation';
import {HeadbalanceallocationService} from '../../../service/headbalanceallocation.service';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {Dialog} from '../../../../global/util/Dialog';
import {Router} from '@angular/router';
import {ApplicationService} from '../../../service/application.service';

@Component({
  selector: 'app-assign-balance-enterprise',
  templateUrl: './assign-balance-enterprise.component.html',
  styleUrls: ['./assign-balance-enterprise.component.css']
})
export class AssignBalanceEnterpriseComponent implements OnInit {

  public title: 'Asignar saldo';
  public balanceForm: FormGroup;
  public enterprise: Enterprise;
  public headbalanceallocation = new Headbalanceallocation();
  public loading: boolean;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public partners: Partner[];
  public partnerSelected: Partner;
  public actualBalance: string;

  constructor(public activeModal: NgbActiveModal,
              private formBuilder: FormBuilder,
              private headbalanceallocationService: HeadbalanceallocationService,
              private authenticationService: AuthService,
              private router: Router,
              private applicationService: ApplicationService) {
    this.createForm();
  }

  ngOnInit() {
    this.setDefaultData();
  }

  private loadDefaultData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partners = LocalStorage.getPartners();
    }
  }

  private setDefaultData() {
    this.actualBalance = Constant.IOFE_COIN + ' ' + this.enterprise._more.balance.toFixed(2);
  }

  public save(): void {
    if ((+this.headbalanceallocation.quantity).toFixed(2) === '0.00') {
      this.balanceForm.controls.additionalBalance.setErrors({errorQuantity: true});
      return;
    }
    if (this.balanceForm.invalid) {
      Object.values(this.balanceForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.register();
  }

  public cancel(): void {
    this.activeModal.close();
  }

  public register() {
    this.setValuesBefore2Save();
    this.loading = true;
    this.headbalanceallocationService.save(this.headbalanceallocation).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.processError(this.title, error);
    });
  }

  private setValuesBefore2Save() {
    this.headbalanceallocation.enterpriseId = this.enterprise.id;
  }

  private createForm() {
    this.balanceForm = this.formBuilder.group(
      {
        actualBalance: [''],
        additionalBalance: ['', [Validators.required]],
      });
  }

  public isInvalidControl(ctrlName: string) {
    return this.balanceForm.get(ctrlName).invalid && this.balanceForm.get(ctrlName).touched;
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  private logout() {
    this.applicationService.setUserLoggedIn(false);
    this.router.navigate(['login']);
  }

  private processError(title: string, error: any) {
    const status = error.status;
    if (status) {
      if (HttpStatusCode.UNAUTHORIZED === status) {
        Dialog.show(InformType.Danger, title, error.error.message);
      } else if (HttpStatusCode.FORBIDDEN === status) {
        Dialog.show(InformType.Info, 'Sesión expirada', 'Su sesión expiró y fue cerrada automáticamente. Por favor inicie sesión nuevamente.');
        this.logout();
      } else if (HttpStatusCode.UPGRADE_REQUIRED === status) {
        Dialog.show(InformType.Warning, title, error.error.message);
      } else {
        Dialog.show(InformType.Danger, title, error.error.message);
      }
    } else {
      Dialog.show(InformType.Danger, title, error.error.message);
    }
  }

}
