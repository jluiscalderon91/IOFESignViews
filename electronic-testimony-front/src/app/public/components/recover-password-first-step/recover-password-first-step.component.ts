import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Constant} from '../../../global/util/Constant';
import {Router} from '@angular/router';
import {AuthService} from '../../../user/service/auth/auth.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ApplicationService} from '../../../user/service/application.service';
import {InformType} from '../../../global/util/enum/InformType';
import {Passwordretriever} from '../../../user/model/Passwordretriever';
import {LocalStorage} from '../../../global/util/LocalStorage';
import HttpStatusCode from '../../../global/util/HttpStatusCode';
import {Dialog} from '../../../global/util/Dialog';

@Component({
  selector: 'app-recover-password-first-step',
  templateUrl: './recover-password-first-step.component.html',
  styleUrls: ['./recover-password-first-step.component.css']
})
export class RecoverPasswordFirstStepComponent {
  public title = 'Recuperar contraseña';
  public recoverForm: FormGroup;
  public loading: boolean;

  public username: string;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private authenticationService: AuthService,
              private modalService: NgbModal,
              private applicationService: ApplicationService) {
    Dialog.createInstance(modalService);
    this.createForm();
    this.loadUUID();
  }

  public loadUUID() {
    const url = Constant.ROOT_API_V1.concat('/public/passwordrecovery/uuid');
    this.applicationService.get(url).subscribe((value: Passwordretriever) => {
      localStorage.setItem('uuid', value.uuid);
    }, error => {
      this.processError(error);
    });
  }

  public doIt() {
    if (this.recoverForm.invalid) {
      Object.values(this.recoverForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.loading = true;
    const url = Constant.ROOT_API_V1.concat('/public/passwordrecovery?uuid=', LocalStorage.getUUID());
    const formData = new FormData();
    formData.append('username', this.username);
    this.applicationService.post(url, formData).subscribe((value: any) => {
      this.loading = false;
      this.router.navigate(['verifycoderecovery'], {queryParams: {hash1: value.hashFirstStep}});
    }, error => {
      this.loading = false;
      this.processError(error);
    });
  }

  private createForm() {
    this.recoverForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required,
        Validators.pattern('^[áéíóúA-Za-z0-9]{4,18}$')])]
    });
  }

  public isInvalidControl(ctrlName: string) {
    return this.recoverForm.get(ctrlName).invalid && this.recoverForm.get(ctrlName).touched;
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  public getErrorMessageBy(ctrl: string): string {
    const control = this.recoverForm.get(ctrl);
    const hasRequiredError = control.hasError('required');
    const hasPatternError = control.hasError('pattern');
    if (hasRequiredError) {
      return 'El nombre de usuario es requerido.';
    } else if (hasPatternError) {
      const actualValue = control.errors.pattern.actualValue;
      return '\''.concat(actualValue, '\' no cumple con el formato necesario.');
    }
  }

  private processError(error: any) {
    const status = error.status;
    if (status) {
      if (HttpStatusCode.NOT_FOUND === status) {
        Dialog.show(InformType.Info, this.title, error.error.message);
      } else {
        Dialog.show(InformType.Danger, this.title);
      }
    } else {
      Dialog.show(InformType.Danger, this.title, error.error.message);
    }
  }
}
