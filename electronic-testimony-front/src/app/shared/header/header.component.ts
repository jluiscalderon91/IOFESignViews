import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../user/service/auth/auth.service';
import {Constant} from '../../global/util/Constant';
import {LocalStorage} from '../../global/util/LocalStorage';
import {EnterpriseService} from '../../user/service/enterprise.service';
import {ViewHistoricalBalanceComponent} from '../../user/components/enterprise/view-historical-balance/view-historical-balance.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public ROLE_USER = Constant.ROLE_USER;
  private interval: any;
  public loading = false;

  constructor(private route: Router,
              private authenticationService: AuthService,
              private enterpriseService: EnterpriseService,
              private modalService: NgbModal) {
  }

  logout() {
    this.route.navigate(['login']);
  }

  public navigateLogin() {
    return this.route.navigate(['login']);
  }

  get isAuthenticated() {
    return this.authenticationService.isAuthenticated();
  }

  get profile(): any {
    if (this.authenticationService.getProfile()) {
      return this.authenticationService.getProfile();
    }
    return {
      partnerName: '',
      personName: '',
      jobDescription: '',
      enterpriseNameView: '',
      roles: ''
    };
  }

  get existJob(): boolean {
    return this.profile.personType !== Constant.NATURAL_PERSON;
  }

  get hasRoles(): boolean {
    return this.profile.roles !== '';
  }

  public hasRole(role: string) {
    return this.authenticationService.hasRole(role);
  }

  public hasntRole(role: string) {
    return !this.authenticationService.hasRole(role);
  }

  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }

  get role(): string {
    if (this.hasRoles) {
      const role = this.profile.roles[Constant.ZERO_INDEX].abbreviation;
      return '@'.concat(role[0].toUpperCase(), role.substr(1).toLowerCase());
    }
  }

  get hasConfigBalance(): boolean {
    return LocalStorage.hasConfigBalance();
  }

  get actualBalance(): string {
    return LocalStorage.actualBalance().toFixed(2);
  }

  get coin(): string {
    return Constant.IOFE_COIN;
  }

  get isAllowedViewActualBalance(): boolean {
    return this.isAuthenticated
      && this.hasConfigBalance
      && this.hasntRole(this.ROLE_SUPERADMIN)
      && this.hasntRole(this.ROLE_USER);
  }

  get isAllowedViewShoppingcard(): boolean {
    return this.isAuthenticated
      && this.hasConfigBalance
      && this.hasntRole(this.ROLE_SUPERADMIN)
      && this.hasntRole(this.ROLE_PARTNER);
  }

  public openModalViewHistoricalBalance(): void {
    const modalRef = this.modalService.open(ViewHistoricalBalanceComponent, {
      backdrop: 'static',
      size: 'xl'
    });
    modalRef.componentInstance.enterpriseId = LocalStorage.getEnterpriseId();
    modalRef.result.then((result) => {
    });
  }
}
