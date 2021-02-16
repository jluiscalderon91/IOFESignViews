import {Component, OnInit} from '@angular/core';
import {Enterprise} from '../../../model/Enterprise';
import {Page} from '../../../../global/util/enum/Page';
import {InformType} from '../../../../global/util/enum/InformType';
import {Constant} from '../../../../global/util/Constant';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../../service/auth/auth.service';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {Siecredential} from '../../../model/Siecredential';
import {SieCredentialService} from '../../../service/sie-credential.service';
import {AddSieCredentialComponent} from '../add-sie-credential/add-sie-credential.component';
import {Partner} from '../../../model/Partner';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-list-sie-credential',
  templateUrl: './list-sie-credential.component.html',
  styleUrls: ['./list-sie-credential.component.css']
})
export class ListSieCredentialComponent implements OnInit {
  private entityName = 'Credenciales SIE';
  public title = this.entityName;
  public siecredentials: Siecredential[] = [];
  public enterprises: Enterprise[] = [];
  public enterpriseIdSelected: number;
  public page: any = {};
  public links: any = {};
  private siecredentialUrl: string;
  public enumPage = Page;
  public loading: boolean;
  public enterpriseSelected: Enterprise;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public ROLE_USER = Constant.ROLE_USER;
  public partnerSelected: Partner;
  public partners: Partner[] = [];

  constructor(public sieCredentialService: SieCredentialService,
              private modalService: NgbModal,
              public authenticationService: AuthService) {
    Dialog.createInstance(modalService);
  }

  ngOnInit() {
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
      this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
      this.enterpriseIdSelected = this.enterpriseSelected.id;
    } else {
      this.enterpriseIdSelected = LocalStorage.getEnterpriseIdView();
    }
    this.loadJobs(Page.First);
  }

  public reloadSiecredentials() {
    this.enterpriseIdSelected = this.enterpriseSelected.id;
    this.loadJobs(Page.First);
  }

  public loadJobs(page: Page): void {
    switch (page) {
      case Page.First:
        this.siecredentialUrl = Constant.ROOT_API_V1
          .concat('/enterprises/')
          .concat(String(this.enterpriseIdSelected))
          .concat('/siecredentials');
        break;
      case Page.Previous:
        this.siecredentialUrl = this.links.prev.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Next:
        this.siecredentialUrl = this.links.next.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Last:
        this.siecredentialUrl = this.links.last.href.replace('http', Constant.SCHEMA);
        break;
      default:
        this.siecredentialUrl = this.links.self.href.replace('http', Constant.SCHEMA);
        break;
    }
    this.getSiecredentials(this.siecredentialUrl);
  }

  private getSiecredentials(url: string) {
    this.loading = true;
    this.sieCredentialService.get(url).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        this.siecredentials = next._embedded.siecredentials;
      } else {
        this.siecredentials = [];
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
    const modalRef = this.modalService.open(AddSieCredentialComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.siecredential = new Siecredential();
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadJobs(Page.Self);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public hasRole(name: string): boolean {
    return this.authenticationService.hasRole(name);
  }

  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }

  public reloadSiecredentials0() {
    this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(this.partnerSelected.id);
    this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
    this.enterpriseIdSelected = this.enterpriseSelected.id;
    this.reloadSiecredentials();
  }
}
