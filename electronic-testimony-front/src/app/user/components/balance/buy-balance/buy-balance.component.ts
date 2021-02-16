import {Component} from '@angular/core';
import {Shoppingcard} from '../../../model/Shoppingcard';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {BuyBalanceService} from '../../../service/buy-balance.service';
import {Constant} from '../../../../global/util/Constant';

@Component({
  selector: 'app-balance',
  templateUrl: './buy-balance.component.html',
  styleUrls: ['./buy-balance.component.css']
})
export class BuyBalanceComponent {

  public shoppingcards: Shoppingcard[];
  public loading: boolean;

  constructor(private buyBalanceService: BuyBalanceService) {
    this.loadDefaultData();
  }

  private loadDefaultData(): void {
    this.loadShoppingcards();
  }

  private loadShoppingcards(): void {
    this.loading = true;
    const url = Constant.ROOT_API_V1 + '/partners/' + LocalStorage.getPartnerId() + '/shoppingbalances';
    this.buyBalanceService.get(url).subscribe((value: any) => {
      this.loading = false;
      this.shoppingcards = value._embedded.shoppingcards;
      console.log(value);
    }, error => {
      this.loading = false;
    });
  }
}
