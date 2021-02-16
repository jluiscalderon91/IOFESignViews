import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Page} from '../../../../global/util/enum/Page';
import {AddEditWorkflowComponent} from '../add-edit-workflow/add-edit-workflow.component';
import {Workflow} from '../../../model/Workflow';
import {InformType} from '../../../../global/util/enum/InformType';
import {Constant} from '../../../../global/util/Constant';
import {WorkflowService} from '../../../service/workflow.service';
import {AddgroupParticipantComponent} from '../../participant/addgroup-participant/addgroup-participant.component';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {AuthService} from '../../../service/auth/auth.service';
import {ApplicationService} from '../../../service/application.service';
import {TemplateDesignWorkflowComponent} from '../design-template-workflow/template-design-workflow.component';
import {CloneTool} from '../../../../global/util/CloneTool';
import {Workflowtype} from '../../../model/Workflowtype';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {Router} from '@angular/router';
import {Partner} from '../../../model/Partner';
import {Dialog} from '../../../../global/util/Dialog';
import {ConfirmComponent} from '../../../../shared/confirm/confirm.component';
import {Response} from '../../../../global/util/enum/Response';
import {ParticipantService} from '../../../service/participant.service';
import {Participant} from '../../../model/Participant';

@Component({
  selector: 'app-list-workflow',
  templateUrl: './list-workflow.component.html',
  styleUrls: ['./list-workflow.component.css']
})
export class ListWorkflowComponent implements OnInit {
  public enterprises: any[] = [];
  public enterpriseSelected: any;
  public enterpriseIdSelected: number;
  public workflows: Workflow[] = [];
  public workflowtypes: Workflowtype[] = [];
  public page: any = {};
  public links: any = {};
  enumPage = Page;
  loading: boolean;
  title = 'Flujo de trabajo';
  private workflowUrl: string;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public ROLE_USER = Constant.ROLE_USER;
  public term2Search: string;
  public partnerSelected: Partner;
  public partners: Partner[] = [];

  constructor(private modalService: NgbModal,
              private workflowService: WorkflowService,
              private authenticationService: AuthService,
              private applicationService: ApplicationService,
              private router: Router,
              private participantService: ParticipantService) {
    Dialog.createInstance(modalService);
    this.loadStaticData();
  }

  ngOnInit() {
    this.setDefaultData();
    this.loadWorkflow(Page.First);
  }

  private setDefaultData() {
    this.workflowtypes = LocalStorage.getWorkflowtypes();
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partners = LocalStorage.getPartners();
      this.partnerSelected = this.partners[Constant.ZERO_INDEX];
      this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(this.partnerSelected.id);
      this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
      this.enterpriseIdSelected = this.enterpriseSelected.id;
    } else if (this.hasRole(this.ROLE_PARTNER)) {
      const partnerId = LocalStorage.getPartnerId();
      this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(partnerId);
      this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
      this.enterpriseIdSelected = this.enterpriseSelected.id;
    } else {
      this.enterpriseIdSelected = this.authenticationService.getEnterpriseIdView();
    }
  }

  public reloadWorkflows() {
    if (this.enterpriseSelected) {
      this.enterpriseIdSelected = this.enterpriseSelected.id;
    }
    this.workflows = [];
    this.loadWorkflow(Page.First);
  }

  public getWorkflowtypeDesc(workflow: Workflow): string {
    return this.workflowtypes.find(value => value.id === workflow.type).nameView;
  }

  public loadWorkflow(page: Page) {
    if (this.term2Search === undefined) {
      this.term2Search = '';
    }
    let partnerId;
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      partnerId = this.partnerSelected.id;
    } else {
      partnerId = LocalStorage.getPartnerId();
    }
    switch (page) {
      case Page.First:
        this.workflowUrl = Constant.ROOT_API_V1
          .concat('/partners/')
          .concat(String(partnerId))
          .concat('/enterprises/')
          .concat(String(this.enterpriseIdSelected))
          .concat('/workflows')
          .concat('?findby=')
          .concat(this.term2Search);
        break;
      case Page.Previous:
        this.workflowUrl = this.links.prev.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Next:
        this.workflowUrl = this.links.next.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Last:
        this.workflowUrl = this.links.last.href.replace('http', Constant.SCHEMA);
        break;
      default:
        this.workflowUrl = this.links.self.href.replace('http', Constant.SCHEMA);
        break;
    }
    this.loading = true;
    this.workflowService.get(this.workflowUrl).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        this.workflows = next._embedded.workflows;
        this.page = next.page;
        this.links = next._links;
      } else {
        Dialog.show(InformType.Info, this.title);
      }
    }, error => {
      this.loading = false;
      this.processError(this.title, error);
    });
  }

  private loadStaticData() {
    this.loading = true;
    if (this.authenticationService.isAuthenticated()) {
      const rootUrl = Constant.ROOT_API_V1.concat('/staticdata');
      this.applicationService.get(rootUrl).subscribe((value: any) => {
        this.loading = false;
        localStorage.setItem('_embedded', JSON.stringify(value));
      }, error => {
        Dialog.show(InformType.Danger, 'Inicio');
      });
    }
  }

  public openModalAdd() {
    const modalRef = this.modalService.open(AddEditWorkflowComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.workflow = new Workflow();
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        Dialog.show(InformType.Success, this.title);
        this.loadWorkflow(Page.Self);
        this.loadStaticData();
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.title);
      }
    });
  }

  public openModalEdit(workflow: Workflow) {
    const workflowToEdit = CloneTool.do(workflow);
    const modalRef = this.modalService.open(AddEditWorkflowComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.workflow = workflowToEdit;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadWorkflow(Page.Self);
        Dialog.show(InformType.Success, this.title);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.title);
      }
    });

  }

  public delete(workflow: Workflow) {
    const modalRef = this.modalService.open(ConfirmComponent);
    modalRef.componentInstance.title = 'Eliminar flujo de trabajo';
    modalRef.componentInstance.body = '¿Está seguro que desea eliminar el flujo de trabajo?';
    modalRef.result.then((result) => {
      if (Response.Yes === result) {
        this.deleteWorkflow(workflow);
      }
    });
  }

  private deleteWorkflow(workflow: Workflow) {
    this.loading = true;
    this.workflowService.delete(workflow.id).subscribe(next => {
      this.loading = false;
      this.loadWorkflow(Page.Self);
      Dialog.show(InformType.Success, this.title);
    }, error => {
      this.loading = false;
      this.processError(this.title, error);
    });
  }

  public openModalAddParticipants(workflow: any) {
    const modalRef = this.modalService.open(AddgroupParticipantComponent, {
      backdrop: 'static',
      size: 'xl'
    });
    modalRef.componentInstance.workflowReceived = workflow;
    modalRef.componentInstance.enterpriseRecived = this.enterpriseSelected;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadWorkflow(Page.Self);
        Dialog.show(InformType.Success, this.title);
      } else if (InformType.Warning === result) {
        Dialog.show(InformType.Warning, this.title);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.title);
      }
    });
  }

  public getParticipantsAndOpen(workflow: any) {
    this.loading = true;
    this.participantService.getParticipants(workflow.id).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        const participants = next._embedded.participants;
        this.openModalDesignTemplate(workflow, participants);
      }
    }, error => {
      this.loading = false;
      this.processError(this.title, error);
    });
  }

  public openModalDesignTemplate(workflow: any, participants: Participant[]) {
    const modalRef = this.modalService.open(TemplateDesignWorkflowComponent, {
      backdrop: 'static',
      size: 'xl'
    });
    modalRef.componentInstance.workflowReceived = workflow;
    modalRef.componentInstance.enterpriseRecived = this.enterpriseSelected;
    modalRef.componentInstance.participants = participants;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadWorkflow(Page.Self);
        Dialog.show(InformType.Success, this.title);
      } else if (InformType.Warning === result) {
        Dialog.show(InformType.Warning, this.title);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.title);
      }
    });
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  public ready2Use(workflow: Workflow): boolean {
    return Constant.READY_TO_USE === workflow.ready2Use;
  }

  public completed(workflow: Workflow): boolean {
    return Constant.COMPLETED === workflow.completed;
  }

  public requiredSieConfig(workflow: Workflow): boolean {
    return Constant.REQUIRED_SIE_CONFIG === workflow._more.requiredSieConfig;
  }

  public sieConfigured(workflow: Workflow) {
    return this.requiredSieConfig(workflow) && Constant.SIE_CONFIGURED === workflow._more.sieConfigured;
  }

  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }

  public search() {
    this.reloadWorkflows();
  }

  private processError(title: string, error: any) {
    const status = error.status;
    if (status) {
      if (HttpStatusCode.UNAUTHORIZED === status) {
        Dialog.show(InformType.Danger, title, error.error.message);
      } else if (HttpStatusCode.FORBIDDEN === status) {
        Dialog.show(InformType.Info, 'Sesión expirada', 'Su sesión expiró y fue cerrada automáticamente. Por favor inicie sesión nuevamente.');
        this.logout();
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

  public reloadWorkflows0() {
    this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(this.partnerSelected.id);
    this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
    this.enterpriseIdSelected = this.enterpriseSelected.id;
    this.reloadWorkflows();
  }

  public isDynamic(workflow: Workflow): boolean {
    return Constant.DYNAMICALLY === workflow.dynamic;
  }
}
