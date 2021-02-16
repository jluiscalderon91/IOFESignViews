import {InformType} from './enum/InformType';
import {InformComponent} from '../../shared/inform/inform.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

export class Dialog {

  private static modalService: NgbModal;

  public static createInstance(modalService: NgbModal) {
    this.modalService = modalService;
  }

  public static show(informType: InformType, title: string, message?: string, modalHeight?: number) {
    const modalRef = this.modalService.open(InformComponent, {backdrop: 'static'});
    if (message) {
      modalRef.componentInstance.message = message;
    }
    if (modalHeight) {
      modalRef.componentInstance.modalHeight = modalHeight;
    }
    modalRef.componentInstance.informType = informType;
    modalRef.componentInstance.title = title;
  }
}
