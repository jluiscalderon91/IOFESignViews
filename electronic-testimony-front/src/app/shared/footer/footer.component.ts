import {Component} from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  fullYear: number;

  constructor() {
    this.fullYear = new Date().getFullYear();
  }

}
