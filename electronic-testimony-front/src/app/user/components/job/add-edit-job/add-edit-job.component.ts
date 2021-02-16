import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Job} from '../../../model/Job';
import {JobService} from '../../../service/job.service';
import {InformType} from '../../../../global/util/enum/InformType';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {AuthService} from '../../../service/auth/auth.service';
import {Constant} from '../../../../global/util/Constant';
import {Enterprise} from '../../../model/Enterprise';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {Partner} from '../../../model/Partner';

@Component({
  selector: 'app-add-edit-job',
  templateUrl: './add-edit-job.component.html',
  styleUrls: ['./add-edit-job.component.css']
})
export class AddEditJobComponent implements OnInit {
  public job: Job;
  public loading: boolean;
  public jobform: FormGroup;
  public enterprises: Enterprise[] = [];
  public partners: Partner[] = [];
  public partnerSelected: Partner;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public jobs: Job[];

  constructor(public activeModal: NgbActiveModal,
              private formBuilder: FormBuilder,
              private jobService: JobService,
              private authenticationService: AuthService) {
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
      if (this.isNewJob) {
        this.job.enterpriseId = this.enterprises[Constant.ZERO_INDEX].id;
      } else {
        this.job.enterpriseId = this.enterprises.find(enterprise => this.job.enterpriseId === enterprise.id).id;
      }
    }
  }

  public save(): void {
    if (this.jobform.invalid) {
      Object.values(this.jobform.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    if (this.existJob) {
      this.activeModal.close(InformType.Warning);
      return;
    }
    this.loading = true;
    this.setValueBefore2Save();
    if (this.isNewJob) {
      this.register();
    } else {
      this.edit();
    }
  }

  get existJob(): boolean {
    return this.jobs.find(job => job.description === this.job.description) !== undefined;
  }

  public cancel(): void {
    this.activeModal.close();
  }

  public register() {
    this.jobService.save(this.job).subscribe(next => {
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
      this.job.enterpriseId = LocalStorage.getEnterpriseIdView();
    }
  }

  public edit() {
    this.jobService.edit(this.job).subscribe(next => {
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

  get isNewJob(): boolean {
    return this.job.id === undefined;
  }

  private createForm() {
    this.jobform = this.formBuilder.group(
      {
        partner: [''],
        enterprise: [],
        description: ['', [Validators.required]],
        status: ['']
      });
  }

  public isInvalidControl(ctrlName: string) {
    return this.jobform.get(ctrlName).invalid && this.jobform.get(ctrlName).touched;
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  public reloadEnterprises() {
    this.enterprises = this.getEnterprises(this.partnerSelected.id);
    if (this.isNewJob) {
      this.job.enterpriseId = this.enterprises[Constant.ZERO_INDEX].id;
    }
  }

  private getEnterprises(partnerId: number): Enterprise[] {
    return LocalStorage.getEnterprises().filter(value => partnerId === value.partnerId && Constant.NOT_EXCLUDED === value.excluded);
  }
}
