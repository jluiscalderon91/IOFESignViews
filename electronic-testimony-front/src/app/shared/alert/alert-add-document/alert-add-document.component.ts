import {Component} from '@angular/core';
import {LocalStorage} from '../../../global/util/LocalStorage';

@Component({
  selector: 'app-alert-add-document',
  templateUrl: './alert-add-document.component.html'
})
export class AlertAddDocumentComponent {

  constructor() {
  }

  /**
   * Mensaje de alerta enviada desde el API "Si usted carga un documento..."
   */
  get addAlertMessage(): string {
    return LocalStorage.getOtherParams().document.addAlertMessage;
  }

}
