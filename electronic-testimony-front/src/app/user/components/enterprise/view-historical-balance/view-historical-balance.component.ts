import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Historicalbalanceallocation} from '../../../model/Historicalbalanceallocation';
import {Constant} from '../../../../global/util/Constant';
import {AuthService} from '../../../service/auth/auth.service';
import {Page} from '../../../../global/util/enum/Page';
import {EnterpriseService} from '../../../service/enterprise.service';
import {Dialog} from '../../../../global/util/Dialog';
import {InformType} from '../../../../global/util/enum/InformType';
import {Detailbalanceallocation} from '../../../model/Detailbalanceallocation';
import {LocalStorage} from '../../../../global/util/LocalStorage';

@Component({
  selector: 'app-view-historical-balance',
  templateUrl: './view-historical-balance.component.html',
  styleUrls: ['./view-historical-balance.component.css']
})
export class ViewHistoricalBalanceComponent implements OnInit {

  public historicalbalanceallocations: Historicalbalanceallocation[] = [];
  public detailbalanceallocations: Detailbalanceallocation[] = [];
  public page: any = {};
  public links: any = {};
  public enumPage = Page;
  private historicalUrl: string;
  public loading = false;
  public enterpriseId: number;
  public title = 'Historial de asignación';
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public balanceType = 1;

  constructor(private activeModal: NgbActiveModal,
              private authenticationService: AuthService,
              private enterpriseService: EnterpriseService) {
  }

  ngOnInit(): void {
    this.loadBalanceallocations(Page.First);
  }

  public accept() {
    this.activeModal.close(ViewHistoricalBalanceComponent);
  }

  public descriptionAssignmentType(historicalbalanceallocation: Historicalbalanceallocation, index: number): string {
    if (!this.hasRole(this.ROLE_SUPERADMIN)) {
      if ((this.page.number === (this.page.totalPages - 1) || this.page.totalPages === 0) && index === this.historicalbalanceallocations.length - 1) {
        return 'Asignación inicial';
      } else if (Constant.IS_RETURNED_BALANCE === historicalbalanceallocation.isReturn) {
        return 'Devolución';
      }
    }
    return this.isPositive(historicalbalanceallocation) ? 'Incremento' : 'Transferencia';
  }

  public symbol(historicalbalanceallocation: Historicalbalanceallocation): string {
    return this.isPositive(historicalbalanceallocation) ? '+' : '';
  }

  public isPositive(historicalbalanceallocation: Historicalbalanceallocation): boolean {
    return historicalbalanceallocation.quantity > 0;
  }

  public classBadge(historicalbalanceallocation: Historicalbalanceallocation): string {
    if (Constant.IS_RETURNED_BALANCE === historicalbalanceallocation.isReturn) {
      return 'badge-danger';
    }
    if (this.isPositive(historicalbalanceallocation)) {
      return 'badge-success';
    } else {
      return 'badge-warning';
    }
  }

  public enterpriseName(historicalbalanceallocation: Historicalbalanceallocation): string {
    return this.isPositive(historicalbalanceallocation) ? '-' : historicalbalanceallocation._more.enterpriseName;
  }

  public hasRole(role: string): boolean {
    return this.authenticationService.hasRole(role);
  }

  public loadBalanceallocations(page: Page): void {
    switch (page) {
      case Page.First:
        if (this.headSelected) {
          this.historicalUrl = Constant.ROOT_API_V1 + '/enterprises/' + this.enterpriseId + '/headbalanceallocations';
        } else {
          this.historicalUrl = Constant.ROOT_API_V1 + '/enterprises/' + this.enterpriseId + '/detailbalanceallocations';
        }
        break;
      case Page.Previous:
        this.historicalUrl = this.links.prev.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Next:
        this.historicalUrl = this.links.next.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Last:
        this.historicalUrl = this.links.last.href.replace('http', Constant.SCHEMA);
        break;
      default:
        this.historicalUrl = this.links.self.href.replace('http', Constant.SCHEMA);
        break;
    }
    if (this.authenticationService.isAuthenticated()) {
      this.getBalanceallocations(this.historicalUrl);
    }
  }

  private getBalanceallocations(url: string) {
    this.loading = true;
    this.enterpriseService.get(url).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        if (this.headSelected) {
          this.historicalbalanceallocations = next._embedded.historicalbalanceallocations;
        } else {
          this.detailbalanceallocations = next._embedded.detailbalanceallocations;
        }
      } else {
        this.historicalbalanceallocations = [];
        this.detailbalanceallocations = [];
      }
      this.page = next.page;
      this.links = next._links;
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, 'Saldos asignados');
    });
  }

  get balanceTypes(): any {
    return [{id: 1, name: 'Saldos asignados'}, {id: 2, name: 'Consumo del saldo'}];
  }

  reloadBalanceInfo(): void {
    this.loadBalanceallocations(Page.First);
  }

  get headSelected(): boolean {
    return this.balanceType === 1;
  }

  public serviceweight(detailbalanceallocation: Detailbalanceallocation): string {
    return LocalStorage.getServices().find(value => value.id === detailbalanceallocation.serviceweightId).description;
  }

  public subjectDocument(detailbalanceallocation: Detailbalanceallocation): string {
    return detailbalanceallocation._more.subjectDocument;
  }

  get coin(): string {
    return Constant.IOFE_COIN;
  }
}
