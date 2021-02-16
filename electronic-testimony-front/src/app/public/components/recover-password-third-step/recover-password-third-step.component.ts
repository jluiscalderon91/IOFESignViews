import {Component} from '@angular/core';
import {Constant} from '../../../global/util/Constant';
import HttpStatusCode from '../../../global/util/HttpStatusCode';
import {InformType} from '../../../global/util/enum/InformType';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../user/service/auth/auth.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ApplicationService} from '../../../user/service/application.service';
import {Person} from '../../../user/model/Person';
import {ProfileService} from '../../../user/service/profile.service';
import {Dialog} from '../../../global/util/Dialog';

@Component({
  selector: 'app-recover-password-third-step',
  templateUrl: './recover-password-third-step.component.html',
  styleUrls: ['./recover-password-third-step.component.css']
})
export class RecoverPasswordThirdStepComponent {
  public title = 'Actualización de contraseña';
  public loading: boolean;
  public hash1: string;
  public hash2: string;
  public person = new Person();
  public personForm: FormGroup;
  public areSamePasswords = true;
  public minLengthPassword = 10;
  public maxLengthPassword = 14;
  public disablePassword = true;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;

  constructor(private formBuilder: FormBuilder,
              private profileService: ProfileService,
              private router: Router,
              private authenticationService: AuthService,
              private modalService: NgbModal,
              private applicationService: ApplicationService,
              private activatedRoute: ActivatedRoute) {
    Dialog.createInstance(modalService);
    this.receiveParams();
    this.validateHash();
    this.createForm();
  }

  public receiveParams() {
    this.activatedRoute.queryParams
      .subscribe(params => {
        this.hash1 = params.hash1;
        this.hash2 = params.hash2;
      });
  }

  private validateHash() {
    this.loading = true;
    const url = Constant.ROOT_API_V1.concat('/public/passwordrecovery/validate2?hash1=', this.hash1, '&hash2=', this.hash2);
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

  public createForm() {
    this.personForm = this.formBuilder.group({
      newPassword: ['', Validators.compose([Validators.required, Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).{' + this.minLengthPassword + ',' + this.maxLengthPassword + '}$')])],
      repeatNewPassword: ['', Validators.compose([Validators.required, Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).{' + this.minLengthPassword + ',' + this.maxLengthPassword + '}$')])]
    });
  }

  public save() {
    if (this.personForm.invalid || !this.areSamePasswords) {
      this.markAsTouchedAllControls();
      return;
    }
    this.setValuesBefore2Save();
    this.loading = true;
    const url = Constant.ROOT_API_V1.concat('/public/passwordrecovery/setup?hash1=', this.hash1, '&hash2=', this.hash2);
    const formData = new FormData();
    formData.append('newPassword', this.person.newPassword);
    this.applicationService.post(url, formData).subscribe(value => {
      this.loading = false;
      localStorage.removeItem('uuid');
      Dialog.show(InformType.Success, this.title, 'La recuperación de contraseña se completó satisfactoriamente. Por favor inicie sesión.');
      this.router.navigate(['login']);
    }, error => {
      this.loading = false;
      this.processError(error);
    });
  }

  private setValuesBefore2Save() {
    if (this.areSamePasswords) {
      this.person.newPassword = this.person.password;
    }
  }

  private markAsTouchedAllControls() {
    Object.values(this.personForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  public cancel() {
    this.router.navigate(['login']);
  }

  public isInvalidControl(name: string) {
    return this.personForm.get(name).invalid && this.personForm.get(name).touched;
  }

  public getErrorMessageBy(ctrl: string): string {
    const control = this.personForm.get(ctrl);
    const hasRequiredError = control.hasError('required');
    const hasPatternError = control.hasError('pattern');
    switch (ctrl) {
      case 'newPassword':
      case 'repeatNewPassword':
        if (hasRequiredError) {
          return 'La contraseña es requerida.';
        } else if (hasPatternError) {
          return 'La contraseña no cumple con el formato necesario';
        }
        break;
    }
  }

  public matchPasswords(event, otherControl: string) {
    const value: string = event.target.value;
    const otherValue: string = this.personForm.get(otherControl).value;
    if (value.length >= this.minLengthPassword && value.length <= this.maxLengthPassword && otherValue.length >= this.minLengthPassword && otherValue.length <= this.maxLengthPassword) {
      if (value === otherValue) {
        this.areSamePasswords = true;
      } else {
        this.areSamePasswords = false;
      }
    } else {
      this.areSamePasswords = false;
    }
  }

  private processError(error: any) {
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
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }
}
