import {Component, OnInit} from '@angular/core';
import {Page} from '../../../../global/util/enum/Page';
import {InformType} from '../../../../global/util/enum/InformType';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../../service/auth/auth.service';
import {Constant} from '../../../../global/util/Constant';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {ConfirmComponent} from '../../../../shared/confirm/confirm.component';
import {Response} from '../../../../global/util/enum/Response';
import {Role} from '../../../model/Role';
import {RoleService} from '../../../service/role.service';
import {AddEditRoleComponent} from '../add-edit-role/add-edit-role.component';
import {AssignAuthorityRoleComponent} from '../assign-authority-role/assign-authority-role.component';
import {AuthorityService} from '../../../service/authority.service';
import {Authority} from '../../../model/Authority';
import {CloneTool} from '../../../../global/util/CloneTool';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-list-role',
  templateUrl: './list-role.component.html',
  styleUrls: ['./list-role.component.css']
})
export class ListRoleComponent implements OnInit {

  public roles: Role[] = [];
  public page: any = {};
  public links: any = {};
  private roleUrl: string;
  public enumPage = Page;
  public loading: boolean;
  public entityName = 'Roles';

  constructor(public roleService: RoleService,
              public authorityService: AuthorityService,
              private modalService: NgbModal,
              public authenticationService: AuthService) {
    Dialog.createInstance(modalService);
  }

  ngOnInit() {
    this.loadDefaultData();
  }

  private loadDefaultData() {
    this.loadRoles(Page.First);
  }

  public loadRoles(page: Page): void {
    switch (page) {
      case Page.First:
        this.roleUrl = Constant.ROOT_API_V1
          .concat('/roles');
        break;
      case Page.Previous:
        this.roleUrl = this.links.prev.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Next:
        this.roleUrl = this.links.next.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Last:
        this.roleUrl = this.links.last.href.replace('http', Constant.SCHEMA);
        break;
      default:
        this.roleUrl = this.links.self.href.replace('http', Constant.SCHEMA);
        break;
    }
    this.getRoles(this.roleUrl);
  }

  private getRoles(url: string) {
    this.loading = true;
    this.roleService.get(url).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        this.roles = next._embedded.roles;
      } else {
        this.roles = [];
      }
      this.page = next.page;
      this.links = next._links;
    }, error => {
      this.loading = false;
      if (HttpStatusCode.UNAUTHORIZED === error.error.status) {
        Dialog.show(InformType.Danger, this.entityName, error.error.message);
      } else {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public openAddModal() {
    const modalRef = this.modalService.open(AddEditRoleComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.role = new Role();
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadRoles(Page.Self);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public openModalEdit(role: Role) {
    const role2Edit = CloneTool.do(role);
    const modalRef = this.modalService.open(AddEditRoleComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.role = role2Edit;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadRoles(Page.Self);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public openModalDelete(role: Role) {
    const modalRef = this.modalService.open(ConfirmComponent);
    modalRef.componentInstance.title = 'Eliminar rol';
    modalRef.componentInstance.body = '¿Está seguro que desea eliminar el rol?';
    modalRef.result.then((result) => {
      if (Response.Yes === result) {
        this.deleteRole(role);
      }
    });
  }

  private deleteRole(role: Role) {
    this.loading = true;
    this.roleService.delete(role).subscribe(next => {
      this.loading = false;
      this.loadRoles(Page.Self);
      Dialog.show(InformType.Success, this.entityName);
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  public hasEditableOption(role: Role): boolean {
    return Constant.EDITABLE === role.editable;
  }

  public openModalAssignAuthority(role: Role) {
    this.loadSelectedAuthoritiesBy(role);
  }

  private loadSelectedAuthoritiesBy(role: Role) {
    this.loading = true;
    const url = Constant.ROOT_API_V1
      .concat('/roles/')
      .concat(String(role.id))
      .concat('/authorities');
    this.authorityService.get(url).subscribe((next: any) => {
      this.loading = false;
      let selectedAuthorities = [];
      if (next._embedded) {
        selectedAuthorities = next._embedded.authorities;
      }
      this.showModalAssignAuthorityRole(role, selectedAuthorities);
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  private showModalAssignAuthorityRole(role: Role, authorities: Authority[]) {
    const modalRef = this.modalService.open(AssignAuthorityRoleComponent, {
      backdrop: 'static',
      size: 'xl'
    });
    modalRef.componentInstance.selectedAuthorities = authorities;
    modalRef.componentInstance.modeAssign = Constant.ROLE_AUTHORITY_MODE;
    modalRef.componentInstance.role = role;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }
}
