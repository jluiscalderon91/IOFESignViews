import {Component, Input} from '@angular/core';
import {Shoppingcard} from '../../user/model/Shoppingcard';
import {BuyBalanceService} from '../../user/service/buy-balance.service';
import {Dialog} from '../../global/util/Dialog';
import {InformType} from '../../global/util/enum/InformType';
import {Constant} from '../../global/util/Constant';
import {ConfirmComponent} from '../confirm/confirm.component';
import {Response} from '../../global/util/enum/Response';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocalStorage} from '../../global/util/LocalStorage';
import {ApplicationService} from '../../user/service/application.service';

@Component({
  selector: 'app-card-balance',
  templateUrl: './card-balance.component.html',
  styleUrls: ['./card-balance.component.css']
})
export class CardBalanceComponent {

  @Input() shoppingcard: Shoppingcard;
  public color: string;

  constructor(public modalService: NgbModal,
              private buyBalanceService: BuyBalanceService,
              private applicationService: ApplicationService) {
    this.color = this.cardColor;
  }

  public openBuyBalanceModal(shoppingcard: Shoppingcard) {
    const modalRef = this.modalService.open(ConfirmComponent);
    modalRef.componentInstance.title = 'Comprar bolsa de monedas';
    modalRef.componentInstance.body = 'Está a punto de adquirir una bolsa de ' + shoppingcard.quantity + ' <small>' + this.coin + '</small>. ¿Proceder con la compra?';
    modalRef.result.then((result) => {
      if (Response.Yes === result) {
        this.buy(shoppingcard);
      }
    });
  }

  public buy(shoppingcard: Shoppingcard): void {
    this.buyBalanceService.save(shoppingcard).subscribe(value => {
      this.loadActualBalance();
      Dialog.show(InformType.Success, 'Compra de monedas');
    }, error => {
      Dialog.show(InformType.Danger, 'Error al comprar');
    });
  }

  get random(): number {
    return +Math.random().toFixed(2) * 100;
  }

  get cardColor(): string {
    const code = this.random;
    if (code >= 0 && code < 21) {
      return 'primary';
    } else if (code >= 21 && code < 41) {
      return 'secondary';
    } else if (code >= 41 && code < 61) {
      return 'success';
    } else if (code >= 61 && code < 81) {
      return 'danger';
    } else if (code >= 81 && code < 101) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  get coin(): string {
    return Constant.IOFE_COIN;
  }

  private loadActualBalance(): void {
    const url = Constant.ROOT_API_V1 + '/actualbalance';
    this.applicationService.get(url).subscribe((value: any) => {
      LocalStorage.setBalanceInfo(value._embedded);
    }, error => {
      Dialog.show(InformType.Danger, 'Saldo actual');
    });
  }
}
