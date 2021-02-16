import {Component, OnInit} from '@angular/core';
import {Page} from '../../../../global/util/enum/Page';
import {InformType} from '../../../../global/util/enum/InformType';
import {Constant} from '../../../../global/util/Constant';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../../service/auth/auth.service';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {AuthorityService} from '../../../service/authority.service';
import {AddEditAuthorityComponent} from '../add-edit-authority/add-edit-authority.component';
import {Authority} from '../../../model/Authority';
import {ConfirmComponent} from '../../../../shared/confirm/confirm.component';
import {Response} from '../../../../global/util/enum/Response';
import {ApplicationService} from '../../../service/application.service';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {Module} from '../../../model/Module';
import {CloneTool} from '../../../../global/util/CloneTool';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-list-authority',
  templateUrl: './list-authority.component.html',
  styleUrls: ['./list-authority.component.css']
})
export class ListAuthorityComponent implements OnInit {
  public authorities: Authority[] = [];
  public page: any = {};
  public links: any = {};
  private authorityUrl: string;
  public enumPage = Page;
  public loading: boolean;
  public entityName = 'Permisos';
  public modules: Module[];

  constructor(public authorityService: AuthorityService,
              public modalService: NgbModal,
              public authenticationService: AuthService,
              public applicationService: ApplicationService) {
    Dialog.createInstance(modalService);
  }

  ngOnInit() {
    this.modules = LocalStorage.getModules();
    this.loadDefaultData();
  }

  private loadDefaultData() {
    this.loadAuthorities(Page.First);
  }

  public loadAuthorities(page: Page): void {
    switch (page) {
      case Page.First:
        this.authorityUrl = Constant.ROOT_API_V1
          .concat('/authorities');
        break;
      case Page.Previous:
        this.authorityUrl = this.links.prev.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Next:
        this.authorityUrl = this.links.next.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Last:
        this.authorityUrl = this.links.last.href.replace('http', Constant.SCHEMA);
        break;
      default:
        this.authorityUrl = this.links.self.href.replace('http', Constant.SCHEMA);
        break;
    }
    this.getAuhtorities(this.authorityUrl);
  }

  private getAuhtorities(url: string) {
    this.loading = true;
    this.authorityService.get(url).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        this.authorities = next._embedded.authorities;
      } else {
        this.authorities = [];
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
    const modalRef = this.modalService.open(AddEditAuthorityComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.authority = new Authority();
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadAuthorities(Page.Self);
        this.loadStaticData();
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public openEditModal(authority: Authority) {
    const authority2Edit = CloneTool.do(authority);
    const modalRef = this.modalService.open(AddEditAuthorityComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.authority = authority2Edit;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadAuthorities(Page.Self);
        this.loadStaticData();
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public openModalDelete(authority: Authority) {
    const modalRef = this.modalService.open(ConfirmComponent);
    modalRef.componentInstance.title = 'Eliminar permiso';
    modalRef.componentInstance.body = '¿Está seguro que desea eliminar el permiso?';
    modalRef.result.then((result) => {
      if (Response.Yes === result) {
        this.deleteAuthority(authority);
      }
    });
  }

  private deleteAuthority(authority: Authority) {
    this.loading = true;
    this.authorityService.delete(authority).subscribe(next => {
      this.loading = false;
      this.loadAuthorities(Page.Self);
      this.loadStaticData();
      Dialog.show(InformType.Success, this.entityName);
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
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
        Dialog.show(InformType.Danger, 'Inicio', 'Error loadign initial data');
      });
    }
  }

  public getModuleDescription(module: number): string {
    return this.modules.find(value => value.id === module).description;
  }

  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }
}
