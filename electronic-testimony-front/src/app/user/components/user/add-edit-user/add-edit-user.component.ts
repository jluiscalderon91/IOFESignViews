import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../../service/auth/auth.service';
import {Constant} from '../../../../global/util/Constant';
import {Partner} from '../../../model/Partner';
import {Enterprise} from '../../../model/Enterprise';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {User} from '../../../model/User';
import {InformType} from '../../../../global/util/enum/InformType';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {UserService} from '../../../service/user.service';

@Component({
  selector: 'app-add-edit-user',
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.css']
})
export class AddEditUserComponent implements OnInit {
  public user: User;
  public loading: boolean;
  public userform: FormGroup;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public partnerSelected: Partner;
  public enterprises: Enterprise[] = [];
  public partners: Partner[] = [];
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public users: User[];
  constructor(public activeModal: NgbActiveModal ,
              private formBuilder: FormBuilder ,
              private userService: UserService ,
              private authenticationService: AuthService) { this.createForm(); }

  ngOnInit(): void {
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
      if (this.isNewUser) {
        this.user.enterpriseId = this.enterprises[Constant.ZERO_INDEX].id;
      } else {
        this.user.enterpriseId = this.enterprises.find(enterprise => this.user.enterpriseId === enterprise.id).id;
      }
    }
  }

  public cancel(): void {
    this.activeModal.close();
  }
  public save(): void {
    if (this.userform.invalid) {
      Object.values(this.userform.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    if (this.existUser) {
      this.activeModal.close(InformType.Warning);
      return;
    }
    this.loading = true;
    this.setValueBefore2Save();
    if (this.isNewUser) {
      this.register();
    } else {
      this.edit();
    }
  }
  public edit() {
    this.userService.edit(this.user).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      if (error.status === HttpStatusCode.FOUND) {
        this.activeModal.close(InformType.Warning);
      }
      this.activeModal.close(InformType.Danger);
    });
  }
  public register() {
    this.userService.save(this.user).subscribe(next => {
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
  private setValueBefore2Save() {
    if (!this.hasRole(this.ROLE_SUPERADMIN) && !this.hasRole(this.ROLE_PARTNER)) {
      this.user.enterpriseId = LocalStorage.getEnterpriseIdView();
    }
  }
  get existUser(): boolean {
    return this.users.find(user => user.username === this.user.username) !== undefined;
  }
  private createForm() {
    this.userform = this.formBuilder.group(
      {
        partner: [''],
        enterprise: [],
        username: ['', [Validators.required]],
        status: ['']
      });
  }

  get isNewUser(): boolean {
    return this.user.id === undefined;
  }
  public reloadEnterprises() {
    this.enterprises = this.getEnterprises(this.partnerSelected.id);
    if (this.isNewUser) {
      this.user.enterpriseId = this.enterprises[Constant.ZERO_INDEX].id;
    }
  }
  private getEnterprises(partnerId: number): Enterprise[] {
    return LocalStorage.getEnterprises().filter(value => partnerId === value.partnerId && Constant.NOT_EXCLUDED === value.excluded);
  }
  public isInvalidControl(ctrlName: string) {
    return this.userform.get(ctrlName).invalid && this.userform.get(ctrlName).touched;
  }
  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }
}
