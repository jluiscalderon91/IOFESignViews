import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {WorkflowService} from '../../../service/workflow.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Workflow} from '../../../model/Workflow';
import {InformType} from '../../../../global/util/enum/InformType';
import {Constant} from '../../../../global/util/Constant';
import {AuthService} from '../../../service/auth/auth.service';
import {Enterprise} from '../../../model/Enterprise';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {Workflowtype} from '../../../model/Workflowtype';
import {Partner} from '../../../model/Partner';
import {WorkflowType} from '../../../../global/util/WorkflowType';

@Component({
  selector: 'app-add-edit-workflow',
  templateUrl: './add-edit-workflow.component.html',
  styleUrls: ['./add-edit-workflow.component.css']
})
export class AddEditWorkflowComponent implements OnInit {
  public loading: boolean;
  public workflowform: FormGroup;
  public workflow: Workflow;
  public partnerSelected: Partner;
  public workflowtypeSelected: Workflowtype;
  public enterprises: Enterprise[] = [];
  public partners: Partner[] = [];
  public workflowtypes: Workflowtype[] = [];
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public checkedDynamically: boolean;

  constructor(public activeModal: NgbActiveModal,
              private workflowService: WorkflowService,
              private formBuilder: FormBuilder,
              private authenticationService: AuthService) {
    this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.setDefaultData();
    if (this.isNewWorkflow) {
      this.workflow.batch = Constant.ONE2ONE;
      this.workflow.type = Constant.SIE_SIGN;
    }
    this.reloadWorkflowOptions();
  }

  private setDefaultData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partnerSelected = this.partners[Constant.ZERO_INDEX];
      this.enterprises = this.getEnterprises(this.partnerSelected.id);
    }
    if (this.hasRole(this.ROLE_SUPERADMIN) || this.hasRole(this.ROLE_PARTNER)) {
      if (this.isNewWorkflow) {
        this.workflow.enterpriseId = this.enterprises[Constant.ZERO_INDEX].id;
      } else {
        this.workflow.enterpriseId = this.enterprises.find(enterprise => this.workflow.enterpriseId === enterprise.id).id;
      }
    }
    if (this.workflow.dynamic === Constant.DYNAMICALLY) {
      this.checkedDynamically = true;
    } else {
      this.checkedDynamically = false;
    }
  }

  private loadInitialData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partners = LocalStorage.getPartners();
    } else if (this.hasRole(this.ROLE_PARTNER)) {
      this.enterprises = LocalStorage.getEnterprises();
    }
    this.workflowtypes = LocalStorage.getWorkflowtypes();
  }

  public save() {
    if (this.workflowform.invalid) {
      Object.values(this.workflowform.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.loading = true;
    this.setValuesBefore2Save();
    if (this.isNewWorkflow) {
      this.register();
    } else {
      this.edit();
    }
  }

  private register() {
    this.workflow.completed = this.selectedAssignmentDynamically ? Constant.COMPLETED : Constant.INCOMPLETE;
    this.workflowService.save(this.workflow).subscribe(workflow => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  private edit() {
    this.workflowService.edit(this.workflow).subscribe(workflow => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  private setValuesBefore2Save() {
    if (!this.hasRole(this.ROLE_SUPERADMIN) && !this.hasRole(this.ROLE_PARTNER)) {
      this.workflow.enterpriseId = LocalStorage.getEnterpriseIdView();
    }
    if (this.workflow.deliver === undefined) {
      this.workflow.deliver = 0;
    }
    if (this.workflow.dynamic === undefined) {
      this.workflow.dynamic = 0;
    }
  }

  public cancel() {
    this.activeModal.close(AddEditWorkflowComponent);
  }

  get isNewWorkflow(): boolean {
    return this.workflow.id === undefined;
  }

  public isInvalidControl(ctrlName: string) {
    return this.workflowform.get(ctrlName).invalid && this.workflowform.get(ctrlName).touched;
  }

  private createForm() {
    this.workflowform = this.formBuilder.group(
      {
        partner: [''],
        enterprise: [''],
        workflowtype: [''],
        dynamic: [''],
        description: ['', Validators.required],
        maxParticipants: ['', Validators.required],
        groupRadio: ['', Validators.required],
        deliver: [''],
        code: [''],
        state: [''],
      });
  }

  public onDeliverChange(checked) {
    this.workflow.deliver = checked ? Constant.DELIVER : Constant.NOT_DELIVER;
  }

  public onAssignmentTypeChange(checked) {
    this.workflow.dynamic = this.checkedDynamically ? Constant.DYNAMICALLY : Constant.STATICALLY;
    if (this.workflow.dynamic === Constant.DYNAMICALLY) {
      this.workflow.maxParticipants = null;
      this.workflow.batch = 0;
      this.workflowform.get('maxParticipants').clearValidators();
      this.workflowform.get('maxParticipants').updateValueAndValidity();
    }
  }

  get selectedAssignmentDynamically() {
    return this.workflow.dynamic === Constant.DYNAMICALLY;
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  private getOf(workflow: Workflow): Enterprise {
    return this.enterprises.find(enterprise => enterprise.id === workflow.enterpriseId);
  }

  get hasDeliverOption(): boolean {
    return LocalStorage.hasDeliverOption();
  }

  public reloadEnterprises() {
    this.enterprises = this.getEnterprises(this.partnerSelected.id);
    if (this.isNewWorkflow) {
      this.workflow.enterpriseId = this.enterprises[Constant.ZERO_INDEX].id;
    }
  }

  private getEnterprises(partnerId: number): Enterprise[] {
    return LocalStorage.getEnterprises().filter(value => partnerId === value.partnerId && Constant.NOT_EXCLUDED === value.excluded);
  }

  public reloadWorkflowOptions() {
    switch (this.workflow.type) {
      case WorkflowType.SIGNATURE:
        this.workflowform.get('maxParticipants').setValidators(Validators.required);
        this.workflowform.get('maxParticipants').updateValueAndValidity();
        break;
      case WorkflowType.SIGNATURE_AND_NOTIFICATION:
        this.checkedDynamically = false;
        this.workflowform.get('maxParticipants').setValidators(Validators.required);
        this.workflowform.get('maxParticipants').updateValueAndValidity();
        break;
      case WorkflowType.SIGNATURE_AND_NOTIFICATION_WITH_TEMPLATE:
        this.workflowform.get('maxParticipants').clearValidators();
        this.workflowform.get('maxParticipants').updateValueAndValidity();
        this.workflow.maxParticipants = null;
        this.checkedDynamically = false;
        break;
    }
  }

  get onlySignatureOptionSelected() {
    return WorkflowType.SIGNATURE === this.workflow.type;
  }

  get signaturAndNotificationWithTemplateOptionSelected() {
    return WorkflowType.SIGNATURE_AND_NOTIFICATION_WITH_TEMPLATE === this.workflow.type;
  }

  get signBatchOptionSelected(): boolean {
    return Constant.BATCH === this.workflow.batch;
  }

  public saludo() {
    switch (this.workflow.batch) {
      case Constant.ONE2ONE:
        // if (this.isNewWorkflow && !this.workflow.maxParticipants) {
        //   this.workflow.maxParticipants = null;
        // }
        console.log('ONE2ONE');
        break;
      case Constant.BATCH:
      default:
        this.workflow.maxParticipants = 1;
        console.log('BATCH');
        break;
    }

  }
}
