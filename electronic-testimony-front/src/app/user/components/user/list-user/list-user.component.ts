import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../service/auth/auth.service';
import {AddEditUserComponent} from '../../user/add-edit-user/add-edit-user.component';
import {InformType} from '../../../../global/util/enum/InformType';
import {Page} from '../../../../global/util/enum/Page';
import {Dialog} from '../../../../global/util/Dialog';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {User} from '../../../model/User';
import {Constant} from '../../../../global/util/Constant';
import {UserService} from '../../../service/user.service';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {Partner} from '../../../model/Partner';
import {Enterprise} from '../../../model/Enterprise';
import {CloneTool} from '../../../../global/util/CloneTool';
import {ConfirmComponent} from '../../../../shared/confirm/confirm.component';
import {Response} from '../../../../global/util/enum/Response';

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.css']
})
export class ListUserComponent implements OnInit {
  public users: User[] = [];
  public enterprises: Enterprise[] = [];
  public title = 'Usuarios';
  private userUrl: string;
  public enterpriseIdSelected: number;
  public links: any = {};
  public loading: boolean;
  private entityName = 'User';
  public enumPage = Page;
  public page: any = {};
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public partnerSelected: Partner;
  public enterpriseSelected: Enterprise;
  public partners: Partner[] = [];

  constructor(public userService: UserService,
              private modalService: NgbModal,
              public authenticationService: AuthService) {
    Dialog.createInstance(modalService);
  }

  ngOnInit(): void {
    this.loadDefaultData();
  }
  private loadDefaultData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partners = LocalStorage.getPartners();
      this.partnerSelected = this.partners[Constant.ZERO_INDEX];
      this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(this.partnerSelected.id);
      this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
      this.enterpriseIdSelected = this.enterpriseSelected.id;
    } else if (this.hasRole(this.ROLE_PARTNER)) {
      const partnerId = LocalStorage.getPartnerId();
      this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(partnerId);
      this.enterpriseSelected = this.enterprises[Constant.FIRST_INDEX];
      this.enterpriseIdSelected = this.enterpriseSelected.id;
    } else {
      this.enterpriseIdSelected = LocalStorage.getEnterpriseIdView();
    }
    this.loadUsers(Page.First);
  }

  public openModalDelete(user: User) {
    const modalRef = this.modalService.open(ConfirmComponent);
    modalRef.componentInstance.title = 'Eliminar usuario';
    modalRef.componentInstance.body = '¿Está seguro que desea eliminar el usuario?';
    modalRef.result.then((result) => {
      if (Response.Yes === result) {
        this.delete(user);
      }
    });
  }
  private delete(user: User) {
    this.loading = true;
    this.userService.delete(user).subscribe(next => {
      this.loading = false;
      this.loadUsers(Page.Self);
      this.reloadUsersBy(this.enterpriseIdSelected);
      Dialog.show(InformType.Success, this.entityName);
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }
  public openModalEdit(user: User) {
    const user2Edit = CloneTool.do(user);
    const modalRef = this.modalService.open(AddEditUserComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.user = user2Edit;
    modalRef.componentInstance.users = this.users;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadUsers(Page.Self);
        this.reloadUsersBy(this.enterpriseIdSelected);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      } else if (InformType.Warning === result) {
        Dialog.show(InformType.Warning, this.entityName, 'El usuario ya se encuentra registrado.');
      }
    });
  }
  public reloadUsers() {
    this.enterpriseIdSelected = this.enterpriseSelected.id;
    this.loadUsers(Page.First);
  }
  public hasRole(name: string) {
    return this.authenticationService.hasRole(name);
  }
  private updateEmbeddedValuesWithNewUsers(users: User[], enterpriseId?: number) {
    const embedded = LocalStorage.getEmbedded();
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      const oldUsers: User[] = embedded.user;
      const newUsers = oldUsers.filter(user => user.enterpriseId !== enterpriseId);
      users.forEach(user => newUsers.push(user));
      embedded.users = newUsers;
    } else {
      embedded.users = users;
    }
    const embeddedRoot: any = {};
    embeddedRoot._embedded = embedded;
    localStorage.setItem('_embedded', JSON.stringify(embeddedRoot));
  }
  private reloadUsersBy(entepriseId: number) {
    this.loading = true;
    const url = Constant.ROOT_API_V1
      .concat('/enterprises/')
      .concat(String(entepriseId))
      .concat('/users');
    this.userService.get(url).subscribe((next: any) => {
        this.loading = false;
        const users = next._embedded.users;
        this.updateEmbeddedValuesWithNewUsers(users, entepriseId);
      }, error => {
        this.loading = false;
        Dialog.show(InformType.Danger, this.entityName);
      });
  }

  public loadUsers(page: Page): void {
    switch (page) {
      case Page.First:
        this.userUrl = Constant.ROOT_API_V1
          .concat('/enterprises/')
          .concat(String(this.enterpriseIdSelected))
          .concat('/users');
        break;
      case Page.Previous:
        this.userUrl = this.links.prev.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Next:
        this.userUrl = this.links.next.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Last:
        this.userUrl = this.links.last.href.replace('http', Constant.SCHEMA);
        break;
      default:
        this.userUrl = this.links.self.href.replace('http', Constant.SCHEMA);
        break;
    }
    this.getUsers(this.userUrl);
  }
  private getUsers(url: string) {
    this.loading = true;
    this.userService.get(url).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        this.users = next._embedded.users;
      } else {
        this.users = [];
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
  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }
  public openAddModal() {
    const modalRef = this.modalService.open(AddEditUserComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.user = new User();
    modalRef.componentInstance.users = this.users;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadUsers(Page.Self);
        this.reloadUsersBy(this.enterpriseIdSelected);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      } else if (InformType.Warning === result) {
        Dialog.show(InformType.Warning, this.entityName, 'El usuario ya se encuentra registrado.');
      }
    });
  }
  public reloadUsers0() {
    this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(this.partnerSelected.id);
    this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
    this.enterpriseIdSelected = this.enterpriseSelected.id;
    this.reloadUsers();
  }
}
