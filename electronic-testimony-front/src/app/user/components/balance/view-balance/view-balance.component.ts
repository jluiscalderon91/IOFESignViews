import {Component, Injectable, OnInit} from '@angular/core';
import {NgbCalendar, NgbDate, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {AuthService} from '../../../service/auth/auth.service';
import {Constant} from '../../../../global/util/Constant';
import {Partner} from '../../../model/Partner';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {Page} from '../../../../global/util/enum/Page';
import {Balancepurchase} from '../../../model/Balancepurchase';
import {BalancepurchaseService} from '../../../service/balancepurchase.service';

/**
 * This Service handles how the date is represented in scripts i.e. ngModel.
 */
@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10)
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;
  }
}

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? this.addCipher(date.day) + this.DELIMITER + this.addCipher(date.month) + this.DELIMITER + date.year : '';
  }

  private addCipher(day: number): string {
    return day < 10 ? '0' + day : String(day);
  }
}

@Component({
  selector: 'app-view-balance',
  templateUrl: './view-balance.component.html',
  styleUrls: ['./view-balance.component.css'],
  providers: [{provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}]
})
export class ViewBalanceComponent implements OnInit {

  public hoveredDate: NgbDate | null = null;
  public fromDate: NgbDate | null;
  public toDate: NgbDate | null;
  public title = 'Saldos por cobrar';
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public partnerSelected: Partner;
  public partners: Partner[];
  private partnerIdSelected: number;
  public page: any = {};
  public links: any = {};
  private url: string;
  public enumPage = Page;
  public loading: boolean;
  private entityName = 'Empresa';
  public balancepurchases: Balancepurchase[] = [];
  private from = new Date();
  private to = new Date();

  constructor(private calendar: NgbCalendar,
              public formatter: NgbDateParserFormatter,
              private authenticationService: AuthService,
              private balancepurchaseService: BalancepurchaseService) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'm', 1);
  }

  ngOnInit() {
    this.loadDefaultData();
    this.setDefaultData();
    this.getBalancepurchase(Page.First);
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  public search(): void {

    this.getBalancepurchase(Page.First);
  }

  private convertDate2Milis(): void {
    this.from.setFullYear(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
    this.to.setFullYear(this.toDate.year, this.toDate.month - 1, this.toDate.day);
  }

  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }

  public hasRole(roleDescription: string): boolean {
    return this.authenticationService.hasRole(roleDescription);
  }

  public reloadEnterprises() {
    this.partnerIdSelected = this.partnerSelected.id;
    this.getBalancepurchase(Page.First);
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

  public getBalancepurchase(page: Page): void {
    this.convertDate2Milis();
    this.balancepurchases = [];
    switch (page) {
      case Page.First:
        this.url = Constant.ROOT_API_V1.concat('/partners/', String(this.partnerIdSelected), '/balancepurchases?from=', String(this.from.getTime()), '&to=', String(this.to.getTime()));
        break;
      case Page.Previous:
        this.url = this.links.prev.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Next:
        this.url = this.links.next.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Last:
        this.url = this.links.last.href.replace('http', Constant.SCHEMA);
        break;
      default:
        this.url = this.links.self.href.replace('http', Constant.SCHEMA);
        break;
    }
    this.loading = true;
    this.balancepurchaseService.get(this.url).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        this.balancepurchases = next._embedded.balancepurchases;
      }
      this.page = next.page;
      this.links = next._links;
    }, error => {
      this.loading = false;
    });
  }

  get coin(): string {
    return Constant.IOFE_COIN;
  }
}
