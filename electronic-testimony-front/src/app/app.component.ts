import {Component, OnDestroy, OnInit} from '@angular/core';
import {Constant} from './global/util/Constant';
import {ApplicationService} from './user/service/application.service';
import {AuthService} from './user/service/auth/auth.service';
import {InformType} from './global/util/enum/InformType';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DEFAULT_INTERRUPTSOURCES, Idle} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';
import {Router} from '@angular/router';
import {IdleconfirmComponent} from './shared/idleconfirm/idleconfirm.component';
import {IdleResponse} from './global/util/enum/IdleResponse';
import HttpStatusCode from './global/util/HttpStatusCode';
import {Dialog} from './global/util/Dialog';
import {LocalStorage} from './global/util/LocalStorage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private idleState = 'Not started.';
  // lastPing?: Date = null;
  private modalRef: any;
  private openedModal = false;
  private hourOnSeconds = 3600;
  private defaultIdletime = 4 * this.hourOnSeconds; // On seconds
  private onModalIdleTime = 2; // On seconds
  private initialTimeout = 10; // On seconds
  public loading = false;
  private interval: any;

  constructor(private applicationService: ApplicationService,
              private authenticationService: AuthService,
              private modalService: NgbModal,
              private idle: Idle,
              private keepalive: Keepalive,
              private router: Router) {
    Dialog.createInstance(modalService);
    this.initIdleConfigs();
  }

  ngOnInit() {
    if (this.authenticationService.isAuthenticated()) {
      this.loadStaticData();
      this.beginAutorefreh();
    }
  }

  ngOnDestroy(): void {
    this.destroyAutorefresh();
  }

  private loadStaticData() {
    this.loading = true;
    const url = Constant.ROOT_API_V1.concat('/staticdata');
    this.applicationService.get(url).subscribe((value: any) => {
      this.loading = false;
      localStorage.setItem('_embedded', JSON.stringify(value));
    }, error => {
      const title = 'Inicio';
      this.processError(title, error);
    });
  }

  private beginAutorefreh() {
    this.interval = setInterval(() => {
      this.loadActualBalance();
    }, 60000);
  }

  private loadActualBalance(): void {
    const url = Constant.ROOT_API_V1 + '/actualbalance';
    this.applicationService.get(url).subscribe((value: any) => {
      LocalStorage.setBalanceInfo(value._embedded);
    }, error => {
      this.processError('Saldo actual', error);
    });
  }

  private initIdleConfigs() {
    this.idle.setIdle(this.defaultIdletime);
    this.idle.setTimeout(this.initialTimeout);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onIdleStart.subscribe(() => {
      if (!this.openedModal) {
        this.showIdleDialog();
      }
    });

    this.idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'Su sesión caducará en ' + countdown + ' segundos!';
      this.modalRef.componentInstance.body = this.idleState;
    });

    this.idle.onIdleEnd.subscribe(() => {
      this.idle.setIdle(this.onModalIdleTime);
      this.idle.setTimeout(this.initialTimeout);
    });

    this.idle.onTimeout.subscribe(() => {
      Dialog.show(InformType.Info, 'Sesión expirada', 'Su sesión expiró por inactividad y fue cerrada de forma automática. Por favor inicie sesión nuevamente.');
      this.logout();
    });

    this.applicationService.getUserLoggedIn().subscribe(userLoggedIn => {
      if (userLoggedIn) {
        this.idle.watch();
      } else {
        this.idle.stop();
      }
    });
  }

  private showIdleDialog() {
    this.openedModal = true;
    this.modalRef = this.modalService.open(IdleconfirmComponent);
    this.modalRef.componentInstance.body = this.idleState;
    this.modalRef.componentInstance.title = 'Atención';
    this.modalRef.result.then((result) => {
      this.openedModal = false;
      if (IdleResponse.Stay === result) {
        this.stay();
      } else if (IdleResponse.Logout === result) {
        this.logout();
      }
    }, (reason => {
      this.openedModal = false;
      this.reset();
      /*if (reason === ModalDismissReasons.ESC) {
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      }*/
    }));
  }

  private reset() {
    this.idle.setIdle(this.defaultIdletime);
    this.idle.watch();
  }

  private closeChildModal(): void {
    this.modalRef.close();
  }

  private stay() {
    this.closeChildModal();
    this.reset();
  }

  private logout() {
    this.closeChildModal();
    this.invalidateSessionAndRedirect();
  }

  private invalidateSessionAndRedirect() {
    this.applicationService.setUserLoggedIn(false);
    this.router.navigate(['login']);
  }

  private processError(title: string, error: any) {
    const status = error.status;
    if (status) {
      if (HttpStatusCode.UNAUTHORIZED === status) {
        Dialog.show(InformType.Danger, title, error.error.message);
      } else if (HttpStatusCode.FORBIDDEN === status) {
        Dialog.show(InformType.Info, 'Sesión expirada', 'Su sesión expiró y fue cerrada automáticamente. Por favor inicie sesión nuevamente.');
        this.invalidateSessionAndRedirect();
      } else {
        Dialog.show(InformType.Danger, title);
      }
    } else {
      Dialog.show(InformType.Danger, title, error.error.message);
    }
  }

  private destroyAutorefresh() {
    clearInterval(this.interval);
  }
}
