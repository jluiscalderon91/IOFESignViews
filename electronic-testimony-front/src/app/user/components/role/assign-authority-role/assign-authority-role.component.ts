import {Component, OnInit} from '@angular/core';
import {Authority} from '../../../model/Authority';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthoritiesList} from '../../../model/AuthoritiesList';
import {RoleService} from '../../../service/role.service';
import {Constant} from '../../../../global/util/Constant';
import {Role} from '../../../model/Role';
import {InformType} from '../../../../global/util/enum/InformType';
import {Person} from '../../../model/Person';
import {AuthorityService} from '../../../service/authority.service';
import {Module} from '../../../model/Module';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-assign-authority-role',
  templateUrl: './assign-authority-role.component.html',
  styleUrls: ['./assign-authority-role.component.css']
})
export class AssignAuthorityRoleComponent implements OnInit {
  public modeAssign;
  public role: Role;
  public person: Person;
  public selectedAuthorities: Authority[];
  public deletedAuthorities: Authority[] = [];
  public authorities: Authority[];
  public authoritiesByRol: Authority[];
  public loading: boolean;
  public entityName = 'Permisos';
  public modules: Module[];

  constructor(public activeModal: NgbActiveModal,
              public roleService: RoleService,
              public authorityService: AuthorityService,
              private modalService: NgbModal) {
    Dialog.createInstance(modalService);
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.modules = LocalStorage.getModules();
    this.authorities = LocalStorage.getAuthorities();
    if (Constant.USER_AUTHORITY_MODE === this.modeAssign) {
      this.loadSelectedAuthoritiesBy(+this.person._more.roles);
    }
  }

  private setInitialData() {
    this.authoritiesByRol.forEach(value => {
      value.active = Constant.INACTIVE;
      this.selectedAuthorities.push(value);
    });
  }

  public save() {
    const authoritiesList = this.buildAuthoritiesList();
    this.setValuesBefore2Save();
    this.loading = true;
    let url;
    if (Constant.ROLE_AUTHORITY_MODE === this.modeAssign) {
      url = Constant.ROOT_API_V1
        .concat('/roles/')
        .concat(String(this.role.id))
        .concat('/authorities');
    } else {
      url = Constant.ROOT_API_V1
        .concat('/people/')
        .concat(String(this.person.id))
        .concat('/authorities');
    }
    this.roleService.saveAuthorities(url, authoritiesList).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  private buildAuthoritiesList(): AuthoritiesList {
    const authoritiesList = new AuthoritiesList();
    authoritiesList.authorities = this.selectedAuthorities;
    return authoritiesList;
  }

  private setValuesBefore2Save() {
    this.addDeletedAuthorities();
  }

  private addDeletedAuthorities() {
    this.deletedAuthorities.forEach(authority => this.selectedAuthorities.push(authority));
  }

  public cancel() {
    this.activeModal.close();
  }

  public addOrRemove(event, authority: Authority) {
    if (event.target.checked) {
      this.selectedAuthorities.push(authority);
      if (this.existOn(this.deletedAuthorities, authority)) {
        this.deleteOf(this.deletedAuthorities, authority);
      }
    } else {
      const toDelete = this.getOf(this.selectedAuthorities, authority);
      toDelete.active = Constant.INACTIVE;
      this.deletedAuthorities.push(toDelete);
      this.deleteOf(this.selectedAuthorities, authority);
    }
  }

  private getOf(authorities: Authority[], authority: Authority): Authority {
    return authorities.find(elemAuthority => elemAuthority.id === authority.id);
  }

  private existOn(authorities: Authority[], authority: Authority): boolean {
    return this.getOf(authorities, authority) !== undefined;
  }

  private deleteOf(authorities: Authority[], authority: Authority) {
    const index = authorities.findIndex(value => authority.id === value.id)
    authorities.splice(index, 1);
  }

  public wasSelected(authority: Authority): boolean {
    return this.isAdded(authority);
  }

  public wasSelectedOnAuthoritiesByRol(authority: Authority): boolean {
    return this.isAddedOnAuthoritiesByRol(authority);
  }

  private isAdded(authority: Authority): boolean {
    return this.selectedAuthorities.find(value => authority.id === value.id) !== undefined;
  }

  private isAddedOnAuthoritiesByRol(authority: Authority): boolean {
    if (this.authoritiesByRol === undefined) {
      return false;
    }
    return this.authoritiesByRol.find(value => authority.id === value.id) !== undefined;
  }

  private loadSelectedAuthoritiesBy(roleId: number) {
    this.loading = true;
    const url = Constant.ROOT_API_V1.concat('/roles/', String(roleId), '/authorities');
    this.authorityService.get(url).subscribe((next: any) => {
      this.loading = false;
      this.authoritiesByRol = next._embedded.authorities;
      this.setInitialData();
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  public getModuleDescription(module: number): string {
    return this.modules.find(value => value.id === module).description;
  }
}
