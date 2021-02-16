import {Component, OnInit} from '@angular/core';
import {EnterpriseService} from '../../../service/enterprise.service';
import {Constant} from '../../../../global/util/Constant';
import {Page} from '../../../../global/util/enum/Page';
import {InformType} from '../../../../global/util/enum/InformType';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AddEditEnterpriseComponent} from '../add-edit-enterprise/add-edit-enterprise.component';
import {Enterprise} from '../../../model/Enterprise';
import {DeleteEnterpriseComponent} from '../delete-enterprise/delete-enterprise.component';
import {ApplicationService} from '../../../service/application.service';
import {AuthService} from '../../../service/auth/auth.service';
import {CloneTool} from '../../../../global/util/CloneTool';
import {Partner} from '../../../model/Partner';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {Dialog} from '../../../../global/util/Dialog';
import {AssignBalanceEnterpriseComponent} from '../assign-balance-enterprise/assign-balance-enterprise.component';
import {ViewHistoricalBalanceComponent} from '../view-historical-balance/view-historical-balance.component';

@Component({
  selector: 'app-list-enterprise',
  templateUrl: './list-enterprise.component.html',
  styleUrls: ['./list-enterprise.component.css']
})
export class ListEnterpriseComponent implements OnInit {
  public enterprises: Enterprise[] = [];
  public page: any = {};
  public links: any = {};
  private enterpriseUrl: string;
  public enumPage = Page;
  public loading: boolean;
  public title = 'Empresas';
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public partnerSelected: Partner;
  public partners: Partner[];
  private partnerIdSelected: number;
  public isCustomer = false;
  public term2Search: string;

  constructor(private enterpriseService: EnterpriseService,
              private modalService: NgbModal,
              private applicationService: ApplicationService,
              private authenticationService: AuthService) {
    Dialog.createInstance(modalService);
  }

  ngOnInit() {
    this.loadDefaultData();
    this.setDefaultData();
    this.getEnterprises(Page.First);
  }

  private loadDefaultData(): void {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partners = LocalStorage.getPartners();
    }
  }

  private setDefaultData(): void {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partnerSelected = this.partners[Constant.ZERO_INDEX];
      this.partnerIdSelected = this.partnerSelected.id;
    } else {
      this.partnerIdSelected = LocalStorage.getPartnerId();
    }
  }

  public getEnterprises(page: Page): void {
    this.term2Search = this.term2Search === undefined ? '' : this.term2Search;
    const onlycustomers = this.hasRole(this.ROLE_ADMIN) ? 'all' : this.isCustomer ? 'yes' : 'no';
    this.enterprises = [];
    switch (page) {
      case Page.First:
        this.enterpriseUrl = Constant.ROOT_API_V1.concat('/partners/', String(this.partnerIdSelected), '/enterprises?onlycustomers=', onlycustomers, '&term2Search=', this.term2Search);
        break;
      case Page.Previous:
        this.enterpriseUrl = this.links.prev.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Next:
        this.enterpriseUrl = this.links.next.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Last:
        this.enterpriseUrl = this.links.last.href.replace('http', Constant.SCHEMA);
        break;
      default:
        this.enterpriseUrl = this.links.self.href.replace('http', Constant.SCHEMA);
        break;
    }
    this.loading = true;
    this.enterpriseService.get(this.enterpriseUrl).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        this.enterprises = next._embedded.enterprises;
      }
      this.page = next.page;
      this.links = next._links;
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.title);
    });
  }

  private loadStaticData(): void {
    this.loading = true;
    const rootUrl = Constant.ROOT_API_V1.concat('/staticdata');
    this.applicationService.get(rootUrl).subscribe((value: any) => {
      this.loading = false;
      localStorage.setItem('_embedded', JSON.stringify(value));
    }, error => {
      Dialog.show(InformType.Danger, 'Inicio');
    });
  }

  openAddModal() {
    const modalRef = this.modalService.open(AddEditEnterpriseComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.enterprise = new Enterprise();
    modalRef.componentInstance.enterprises = this.enterprises;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadStaticData();
        this.getEnterprises(Page.First);
        Dialog.show(InformType.Success, this.title);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.title);
      } else if (InformType.Warning === result) {
        Dialog.show(InformType.Warning, this.title, 'La empresa ya se encuentra registrada.');
      }
    });
  }

  public openModalEdit(enterprise: Enterprise): void {
    const enterprise2Edit = CloneTool.do(enterprise);
    const modalRef = this.modalService.open(AddEditEnterpriseComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.enterprise = enterprise2Edit;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.getEnterprises(Page.Self);
        Dialog.show(InformType.Success, this.title);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.title);
      }
    });
  }

  public openModalAssignBalance(enterprise: Enterprise): void {
    const modalRef = this.modalService.open(AssignBalanceEnterpriseComponent, {
      backdrop: 'static',
      size: 'sm'
    });
    modalRef.componentInstance.enterprise = enterprise;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.getEnterprises(Page.Self);
        Dialog.show(InformType.Success, this.title);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.title);
      }
    });
  }

  public openModalViewHistoricalBalance(enterprise: Enterprise): void {
    const modalRef = this.modalService.open(ViewHistoricalBalanceComponent, {
      backdrop: 'static',
      size: 'xl'
    });
    modalRef.componentInstance.enterpriseId = enterprise.id;
    modalRef.result.then((result) => {
    });
  }

  public delete(enterprise: Enterprise): void {
    const modalRef = this.modalService.open(DeleteEnterpriseComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.enterprise = enterprise;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.getEnterprises(Page.Self);
        this.loadActualBalance();
        Dialog.show(InformType.Success, this.title);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.title);
      }
    });
  }

  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }

  public hasRole(roleDescription: string): boolean {
    return this.authenticationService.hasRole(roleDescription);
  }

  public reloadEnterprises() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partnerIdSelected = this.partnerSelected.id;
    } else {
      this.partnerIdSelected = LocalStorage.getPartnerId();
    }
    this.getEnterprises(Page.First);
  }

  get coin(): string {
    return Constant.IOFE_COIN;
  }

  public isntPartner(enterprise: Enterprise): boolean {
    return Constant.IS_NOT_PARTNER === enterprise.isPartner;
  }

  public isPartner(enterprise: Enterprise): boolean {
    return Constant.IS_PARTNER === enterprise.isPartner;
  }

  private loadActualBalance(): void {
    const url = Constant.ROOT_API_V1 + '/actualbalance';
    this.applicationService.get(url).subscribe((value: any) => {
      LocalStorage.setBalanceInfo(value._embedded);
    }, error => {
      Dialog.show(InformType.Danger, 'Saldo actual');
    });
  }

  public onlyCustomersClic(event): void {
    this.isCustomer = event.target.checked;
    this.reloadEnterprises();
  }

  public isAllowedEdit(enterprise: Enterprise): boolean {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      return true;
    } else if (this.hasRole(this.ROLE_PARTNER)) {
      return enterprise.partnerId === LocalStorage.getPartnerId();
    } else if (this.hasRole(this.ROLE_ADMIN)) {
      return enterprise.partnerId === LocalStorage.getPartnerId() && enterprise.createdByPersonId === LocalStorage.getPersonId();
    }
    return false;
  }

  public balance(enterprise: Enterprise): string {
    if (enterprise.isCustomer && !this.hasRole(this.ROLE_ADMIN)) {
      return enterprise._more.balance.toFixed(2);
    }
    return '-';
  }
}
