import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {InformType} from '../../global/util/enum/InformType';

@Component({
  selector: 'app-inform',
  templateUrl: './inform.component.html',
  styleUrls: ['./inform.component.css']
})
export class InformComponent implements OnInit {
  private informType: InformType;
  public informCodeDesc: string;
  public title: string;
  public iconClass = 'fa-2x fas ';
  public message: string;
  public modalHeight: number;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    this.selectMessageInform(this.informType);
  }

  accept(): void {
    this.activeModal.close('accepted');
  }

  private selectMessageInform(informType: InformType) {
    switch (informType) {
      case InformType.Success:
        this.informCodeDesc = 'success';
        if (this.message === undefined) {
          this.message = 'La operación se completó satisfactoriamente';
        }
        this.iconClass += 'fa-info-circle text-success';
        break;
      case InformType.Info:
        this.informCodeDesc = 'info';
        if (this.message === undefined) {
          this.message = 'No hay registros disponibles';
        }
        this.iconClass += 'fa-info-circle text-info';
        break;
      case InformType.Warning:
        this.informCodeDesc = 'danger';
        if (this.message === undefined) {
          this.message = 'Registro ya existe en el sistema';
        }
        this.iconClass += 'fa-info-circle text-warning';
        break;
      case InformType.Danger:
        this.informCodeDesc = 'danger';
        if (this.message === undefined) {
          this.message = 'No se completó la operación solicitada';
        }
        this.iconClass += 'fa-exclamation-circle text-danger';
        break;
    }
  }

  get customStyleModal(): string {
    if (this.modalHeight) {
      return 'height: ' + this.modalHeight + 'px;';
    }
  }
}
