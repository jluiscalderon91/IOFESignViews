import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../user/service/auth/auth.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ApplicationService} from '../../../user/service/application.service';
import {Constant} from '../../../global/util/Constant';
import {LocalStorage} from '../../../global/util/LocalStorage';
import {InformType} from '../../../global/util/enum/InformType';
import HttpStatusCode from '../../../global/util/HttpStatusCode';
import {Dialog} from '../../../global/util/Dialog';

@Component({
  selector: 'app-recover-password-second-step',
  templateUrl: './recover-password-second-step.component.html',
  styleUrls: ['./recover-password-second-step.component.css']
})
export class RecoverPasswordSecondStepComponent {
  public title = 'Verificación de código';
  public recoverForm: FormGroup;
  public loading: boolean;
  public verificationCode: string;
  public hash1: string;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private authenticationService: AuthService,
              private modalService: NgbModal,
              private applicationService: ApplicationService,
              private activatedRoute: ActivatedRoute) {
    Dialog.createInstance(modalService);
    this.receiveParams();
    this.createForm();
    this.validateHash();
  }

  public receiveParams() {
    this.activatedRoute.queryParams
      .subscribe(params => {
        this.hash1 = params.hash1;
      });
  }

  private validateHash() {
    this.loading = true;
    const url = Constant.ROOT_API_V1.concat('/public/passwordrecovery/validate1?hash1=', this.hash1);
    this.applicationService.post(url, new FormData()).subscribe(value => {
      this.loading = false;
    }, error => {
      this.loading = false;
      const status = error.status;
      if (status) {
        if (HttpStatusCode.NOT_FOUND === status) {
          Dialog.show(InformType.Info, this.title, error.error.message);
          this.router.navigate(['login']);
        } else {
          Dialog.show(InformType.Danger, this.title);
        }
      } else {
        Dialog.show(InformType.Danger, this.title, error.error.message);
      }
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
    const url = Constant.ROOT_API_V1.concat('/public/passwordrecovery/verification?uuid=', LocalStorage.getUUID(), '&hash=', this.hash1);
    const formData = new FormData();
    formData.append('verificationCode', this.verificationCode);
    this.applicationService.post(url, formData).subscribe((value: any) => {
      this.loading = false;
      // localStorage.setItem('hash2', value.hashSecondStep);
      this.router.navigate(['setuppassword'], {queryParams: {hash1: this.hash1, hash2: value.hashSecondStep}});
    }, error => {
      this.loading = false;
      this.processError(error);
    });
  }

  private createForm() {
    this.recoverForm = this.formBuilder.group({
      verificationCode: ['', Validators.compose([Validators.required,
        Validators.pattern('^[0-9]{6}$')])]
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
      return 'El código de verificación es requerido.';
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
