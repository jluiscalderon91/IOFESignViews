import {Component, OnInit} from '@angular/core';
import {InformType} from '../../../../global/util/enum/InformType';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AddEditPersonComponent} from '../add-edit-person/add-edit-person.component';
import {Person} from '../../../model/Person';
import {PersonService} from '../../../service/person.service';
import {DeletePersonComponent} from '../delete-person/delete-person.component';
import {Page} from '../../../../global/util/enum/Page';
import {Constant} from '../../../../global/util/Constant';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {AuthService} from '../../../service/auth/auth.service';
import {AssignWorkflowPersonComponent} from '../assign-workflow-person/assign-workflow-person.component';
import {WorkflowService} from '../../../service/workflow.service';
import {ConfirmComponent} from '../../../../shared/confirm/confirm.component';
import {Response} from '../../../../global/util/enum/Response';
import {AssignAuthorityRoleComponent} from '../../role/assign-authority-role/assign-authority-role.component';
import {Authority} from '../../../model/Authority';
import {AuthorityService} from '../../../service/authority.service';
import {CloneTool} from '../../../../global/util/CloneTool';
import {Enterprise} from '../../../model/Enterprise';
import {Partner} from '../../../model/Partner';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-list-person',
  templateUrl: './list-person.component.html',
  styleUrls: ['./list-person.component.css']
})
export class ListPersonComponent implements OnInit {
  public person: Person;
  public people: any[] = [];
  public loading: boolean;
  private entityName = 'Persona';
  public page: any = {};
  public links: any = {};
  public enumPage = Page;
  private personUrl: string;
  public enterprises: Enterprise[] = [];
  public partners: Partner[] = [];
  public participantTypes: any[] = [];
  public roles: any[] = [];
  public roleSelected: any;
  public enterpriseIdSelected: number;
  public partnerIdSelected: number;
  public enterpriseSelected: Enterprise;
  public partnerSelected: Partner;
  public participantTypeSelected: any;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public ROLE_USER = Constant.ROLE_USER;
  public term2Search;

  constructor(private modalService: NgbModal,
              private personService: PersonService,
              private authenticationService: AuthService,
              private workflowService: WorkflowService,
              private authorityService: AuthorityService) {
    Dialog.createInstance(modalService);
  }

  ngOnInit() {
    this.setDefaultData();
    this.loadPeople(Page.First);
  }

  private setDefaultData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partners = LocalStorage.getPartners();
      this.partnerSelected = this.partners[Constant.ZERO_INDEX];
      this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(this.partnerSelected.id);
      this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
      this.enterpriseIdSelected = this.enterpriseSelected.id;
      this.roles = LocalStorage.getRolesAndAllOption();
      this.roleSelected = this.roles[Constant.ZERO_INDEX];
    } else if (this.hasRole(this.ROLE_PARTNER)) {
      const partnerId = LocalStorage.getPartnerId();
      this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(partnerId);
      this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
      this.enterpriseIdSelected = this.enterpriseSelected.id;
      this.roles = LocalStorage.getRolesAndAllOption();
      this.roleSelected = this.roles[Constant.ZERO_INDEX];
    } else {
      if (this.hasRole(this.ROLE_ADMIN)) {
        this.roles = LocalStorage.getRolesAndAllOption();
        this.roleSelected = this.roles[Constant.ZERO_INDEX];
      }
      this.enterpriseIdSelected = this.authenticationService.getEnterpriseIdView();
    }
    this.participantTypes = LocalStorage.getParticipantTypes();
    this.participantTypeSelected = this.participantTypes[Constant.ZERO_INDEX];
  }

  public reloadPeople1() {
    if (this.enterpriseSelected) {
      this.enterpriseIdSelected = this.enterpriseSelected.id;
    }
    this.people = [];
    this.loadPeople(Page.First);
  }

  public loadPeople(page: Page) {
    if (this.term2Search === undefined) {
      this.term2Search = '';
    }
    switch (page) {
      case Page.First:
        let partnerId;
        if (!this.hasRole(this.ROLE_SUPERADMIN)) {
          partnerId = LocalStorage.getPartnerId();
        } else {
          partnerId = this.partnerSelected.id;
        }
        let enterpriseId;
        if (!this.hasRole(this.ROLE_SUPERADMIN) && !this.hasRole(this.ROLE_PARTNER)) {
          enterpriseId = this.authenticationService.getEnterpriseIdView();
        } else {
          enterpriseId = this.enterpriseSelected.id;
        }
        this.personUrl = Constant.ROOT_API_V1
          .concat('/partners/')
          .concat(String(partnerId))
          .concat('/enterprises/')
          .concat(String(enterpriseId))
          .concat('/roles/')
          .concat(this.roleSelected.id)
          .concat('/participanttypes/')
          .concat(String(this.participantTypeSelected.id))
          .concat('/people')
          .concat('?findby=')
          .concat(this.term2Search);
        break;
      case Page.Previous:
        this.personUrl = this.links.prev.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Next:
        this.personUrl = this.links.next.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Last:
        this.personUrl = this.links.last.href.replace('http', Constant.SCHEMA);
        break;
      default:
        this.personUrl = this.links.self.href.replace('http', Constant.SCHEMA);
        break;
    }
    this.loading = true;
    this.personService.get(this.personUrl).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        this.people = next._embedded.people;
        this.page = next.page;
        this.links = next._links;
      } else {
        Dialog.show(InformType.Info, this.entityName);
      }
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  public openModalAdd() {
    const modalRef = this.modalService.open(AddEditPersonComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.personReceived = new Person();
    modalRef.componentInstance.purpose4Form = Constant.ADD;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadPeople(Page.First);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Warning === result) {
        Dialog.show(InformType.Warning, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public delete(person: Person) {
    const modalRef = this.modalService.open(DeletePersonComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.person = person;
    modalRef.componentInstance.enterpriseIdSelected = this.enterpriseIdSelected;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadPeople(Page.Self);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public openModalEdit(person: Person) {
    const personToEdit = CloneTool.do(person);
    const modalRef = this.modalService.open(AddEditPersonComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.purpose4Form = Constant.EDIT;
    modalRef.componentInstance.personReceived = personToEdit;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadPeople(Page.Self);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public openModalResetPassword(person: Person) {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.title = 'Resetear contraseña';
    modalRef.componentInstance.body = '¿Está seguro que desea resetear la contraseña?';
    modalRef.result.then((result) => {
      if (Response.Yes === result) {
        this.resetPassword(person);
      }
    });
  }

  private resetPassword(person: Person) {
    this.loading = true;
    const resetPassUrl = Constant.ROOT_API_V1.concat('/people/').concat(String(person.id)).concat('/resetpassword');
    this.personService.resetPassword(resetPassUrl).subscribe(next => {
      this.loading = false;
      Dialog.show(InformType.Success, this.entityName);
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  public openModalAssignWorkflow(person: Person) {
    this.loading = true;
    let workflows: any[] = [];
    const url = Constant.ROOT_API_V1
      .concat('/people/')
      .concat(String(person.id))
      .concat('/workflows');
    this.workflowService.get(url).subscribe((value: any) => {
      this.loading = false;
      if (value._embedded) {
        workflows = value._embedded.workflows;
      }
      const modalRef = this.modalService.open(AssignWorkflowPersonComponent, {
        backdrop: 'static',
      });
      modalRef.componentInstance.personReceived = person;
      modalRef.componentInstance.selectedWorkflows = workflows;
      modalRef.result.then((result) => {
        if (InformType.Success === result) {
          Dialog.show(InformType.Success, this.entityName);
        } else if (InformType.Danger === result) {
          Dialog.show(InformType.Danger, this.entityName);
        }
      });
    }, error => {
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  get isInvited(): boolean {
    return Constant.INVITED === this.participantTypeSelected.id;
  }

  public openModalAssignMoreAuthorities(person: Person) {
    this.loadSelectedAuthoritiesBy(person);
  }

  private loadSelectedAuthoritiesBy(person: Person) {
    this.loading = true;
    const url = Constant.ROOT_API_V1
      .concat('/people/')
      .concat(String(person.id))
      .concat('/authorities');
    this.authorityService.get(url).subscribe((next: any) => {
      this.loading = false;
      let selectedAuthorities = [];
      if (next._embedded) {
        selectedAuthorities = next._embedded.authorities;
      }
      this.showModalAssignAuthorities(person, selectedAuthorities);
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }

  public search() {
    this.reloadPeople1();
  }

  private showModalAssignAuthorities(person: Person, authorities: Authority[]) {
    const modalRef = this.modalService.open(AssignAuthorityRoleComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.selectedAuthorities = authorities;
    modalRef.componentInstance.modeAssign = Constant.USER_AUTHORITY_MODE;
    modalRef.componentInstance.person = person;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public reloadPeople0() {
    this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(this.partnerSelected.id);
    this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
    this.enterpriseIdSelected = this.enterpriseSelected.id;
    this.reloadPeople1();
  }
}
