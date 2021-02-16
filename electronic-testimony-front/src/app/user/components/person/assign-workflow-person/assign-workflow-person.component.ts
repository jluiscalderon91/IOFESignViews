import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InformType} from '../../../../global/util/enum/InformType';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {PersonService} from '../../../service/person.service';
import {AuthService} from '../../../service/auth/auth.service';
import {Constant} from '../../../../global/util/Constant';
import {StringUtil} from '../../../../global/util/StringUtil';

@Component({
  selector: 'app-assign-workflow-person',
  templateUrl: './assign-workflow-person.component.html',
  styleUrls: ['./assign-workflow-person.component.css']
})
export class AssignWorkflowPersonComponent implements OnInit {
  public authorityForm: FormGroup;
  public role: any;
  public loading: boolean;
  public selectedWorkflows: any[];
  public personReceived;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;

  public enterpriseId: number;
  public workflows: any[] = [];

  constructor(public activeModal: NgbActiveModal,
              private personService: PersonService,
              private authenticationService: AuthService,
              private formBuilder: FormBuilder) {
    this.createForm();
  }

  ngOnInit() {
    this.loadDefaultData();
  }

  public loadDefaultData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.enterpriseId = this.personReceived.enterpriseIdView;
    } else {
      this.enterpriseId = LocalStorage.getEnterpriseIdView();
    }
    this.workflows = LocalStorage.getWorkflows(this.enterpriseId);
  }

  private isNewRole() {
    return this.role.id === undefined;
  }

  public save() {
    const checkedWorkflows = this.getConcatSelectedWorkflows();
    this.personReceived.workflows = checkedWorkflows;
    this.loading = true;
    this.personService.saveWorkflows(this.personReceived).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  private getConcatSelectedWorkflows(): string {
    let value = '';
    for (const workflow of this.selectedWorkflows) {
      value += ''
        .concat(workflow.id)
        .concat(',')
        .concat(workflow.active)
        .concat('|');
    }
    return StringUtil.removeLastCharacter(value);
  }

  public cancel() {
    this.activeModal.close(-1);
  }

  public wasSelected(workflow: any) {
    return this.isAdded(workflow);
  }

  public addRemove(event: any, workflow: any) {
    const index = this.getIndexOf(workflow);
    if (index !== -1) {
      this.selectedWorkflows[index].active = +!this.selectedWorkflows[index].active;
    } else {
      this.selectedWorkflows.push(workflow);
    }
  }

  private isAdded(workflow: any) {
    return this.selectedWorkflows.find(value => value.id === workflow.id) !== undefined;
  }

  private getIndexOf(workflow: any): number {
    return this.selectedWorkflows.findIndex(value => value.id === workflow.id);
  }

  private createForm() {
    this.authorityForm = this.formBuilder.group({
      workflowCheckbox: ['', [Validators.required]]
    });
  }

  get areThereSelectedWorkflows() {
    return this.selectedWorkflows.length !== 0;
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }
}
