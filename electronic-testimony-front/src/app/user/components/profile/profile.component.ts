import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Constant} from '../../../global/util/Constant';
import {LocalStorage} from '../../../global/util/LocalStorage';
import {Person} from '../../model/Person';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProfileService} from '../../service/profile.service';
import {Router} from '@angular/router';
import HttpStatusCode from '../../../global/util/HttpStatusCode';
import {InformType} from '../../../global/util/enum/InformType';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ApplicationService} from '../../service/application.service';
import {AuthService} from '../../service/auth/auth.service';
import {Dialog} from '../../../global/util/Dialog';
import {StringUtil} from '../../../global/util/StringUtil';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  public person = new Person();
  public title = 'Perfil de usuario';
  public personForm: FormGroup;
  public loading: boolean;
  public areSamePasswords = true;
  public minLengthPassword = 10;
  public maxLengthPassword = 14;
  public disablePassword = true;
  public readonly DEFAULT_PASSWORD = '************';
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public REQUIRED_CAPTCHA = false;
  public rubricSrc: string | ArrayBuffer;
  public previewRubricWidth = '355';
  public previewRubricHeight = '150';
  @ViewChild('rubricPic', {static: false}) rubricPic: ElementRef;

  constructor(private profileService: ProfileService,
              private formBuilder: FormBuilder,
              private router: Router,
              private modalService: NgbModal,
              private applicationService: ApplicationService,
              private authenticationService: AuthService) {
    Dialog.createInstance(modalService);
    this.createForm();
    this.loadDefaultData();
  }

  ngOnInit(): void {
    if (this.disablePassword) {
      this.personForm.get('newPassword').clearValidators();
      this.personForm.get('repeatNewPassword').clearValidators();
      this.updateValuesAndValidities();
    }
  }

  private loadDefaultData() {
    this.loading = true;
    const personId = LocalStorage.getPersonId();
    const url = Constant.ROOT_API_V1.concat('/people/', String(personId));
    this.profileService.get(url).subscribe((value: Person) => {
      this.person = value;
      this.setDefaultValues();
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }

  private setDefaultValues() {
    this.person.password = this.DEFAULT_PASSWORD;
    this.person.repeatNewPassword = this.DEFAULT_PASSWORD;
    this.loadRubricSrc(this.person);
    this.personForm.get('rubricFilename2Show').setValue(this.person._more.rubricFilename);
  }

  public createForm() {
    this.personForm = this.formBuilder.group({
      oldPassword: ['', Validators.compose([Validators.required, Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).{' + this.minLengthPassword + ',' + this.maxLengthPassword + '}$')])],
      newPassword: ['', Validators.compose([Validators.required, Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).{' + this.minLengthPassword + ',' + this.maxLengthPassword + '}$')])],
      repeatNewPassword: ['', Validators.compose([Validators.required, Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).{' + this.minLengthPassword + ',' + this.maxLengthPassword + '}$')])],
      email: ['', Validators.compose([Validators.required,
        Validators.pattern('^([a-zA-Z0-9_\\-\\.]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([a-zA-Z0-9\\-]+\\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\\]?)$')])],
      cellphone: [''],
      recaptchaReactive: [''],
      rubricFileBase64: [''],
      rubricFilename: [''],
      rubricFilename2Show: [''],
    });
  }

  public save() {
    if (this.personForm.invalid || !this.areSamePasswords) {
      this.markAsTouchedAllControls();
      return;
    }
    this.setValuesBefore2Save();
    this.loading = true;
    const personId = LocalStorage.getPersonId();
    const url = Constant.ROOT_API_V1.concat('/people/', String(personId), '/profile');
    this.profileService.update(url, this.person).subscribe(value => {
      this.loading = false;
      if (!this.hasRole(this.ROLE_SUPERADMIN)) {
        this.router.navigate(['document']);
      } else {
        this.router.navigate(['enterprise']);
      }
    }, error => {
      this.loading = false;
      this.processError(error);
    });
  }

  private setValuesBefore2Save() {
    if (this.DEFAULT_PASSWORD === this.person.password || this.DEFAULT_PASSWORD === this.person.repeatNewPassword) {
      this.person.newPassword = undefined;
    } else if (this.areSamePasswords) {
      this.person.newPassword = this.person.password;
    }
    this.person.rubricBase64Data = this.personForm.get('rubricFileBase64').value;
    this.person.rubricFilename = this.personForm.get('rubricFilename').value;
  }

  private markAsTouchedAllControls() {
    Object.values(this.personForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  public cancel() {
    if (!this.hasRole(this.ROLE_SUPERADMIN)) {
      this.router.navigate(['document']);
    } else {
      this.router.navigate(['enterprise']);
    }
  }

  public isInvalidControl(name: string) {
    return this.personForm.get(name).invalid && this.personForm.get(name).touched;
  }

  public getErrorMessageBy(ctrl: string): string {
    const control = this.personForm.get(ctrl);
    const hasRequiredError = control.hasError('required');
    const hasPatternError = control.hasError('pattern');
    switch (ctrl) {
      case 'oldPassword':
      case 'newPassword':
      case 'repeatNewPassword':
        if (hasRequiredError) {
          return 'La contraseña es requerida.';
        } else if (hasPatternError) {
          return 'La contraseña no cumple con el formato necesario';
        }
        break;
      case 'email':
        if (hasRequiredError) {
          return 'El correo electrónico es requerido.';
        } else if (hasPatternError) {
          const actualValue = control.errors.pattern.actualValue;
          return actualValue.concat(' no cumple con el formato necesario.');
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

  public disablePasswordControls(event) {
    this.disablePassword = !this.disablePassword;
    event.target.checked = !event.target.checked;
    if (event.target.checked) {
      this.personForm.get('newPassword').clearValidators();
      this.personForm.get('repeatNewPassword').clearValidators();
      this.updateValuesAndValidities();
      this.areSamePasswords = true;
    } else {
      this.person.password = this.DEFAULT_PASSWORD;
      this.person.repeatNewPassword = this.DEFAULT_PASSWORD;
      this.personForm.get('newPassword').setValidators(Validators.compose([Validators.required, Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).{' + this.minLengthPassword + ',' + this.maxLengthPassword + '}$')]));
      this.personForm.get('repeatNewPassword').setValidators(Validators.compose([Validators.required, Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\\s).{' + this.minLengthPassword + ',' + this.maxLengthPassword + '}$')]));
      this.updateValuesAndValidities();
    }
  }

  private updateValuesAndValidities() {
    this.personForm.get('newPassword').updateValueAndValidity();
    this.personForm.get('repeatNewPassword').updateValueAndValidity();
  }

  private processError(error: any) {
    const status = error.status;
    if (status) {
      if (HttpStatusCode.UNAUTHORIZED === status) {
        Dialog.show(InformType.Danger, this.title, error.error.message);
        this.person.oldPassword = '';
      } else if (HttpStatusCode.PAYMENT_REQUIRED === status) {
        this.applyCaptchaValidators();
        this.REQUIRED_CAPTCHA = true;
        this.person.oldPassword = '';
        this.personForm.get('recaptchaReactive').setValue('');
        Dialog.show(InformType.Danger, this.title, error.error.message);
      } else if (HttpStatusCode.FORBIDDEN === status) {
        Dialog.show(InformType.Info, 'Sesión expirada', 'Su sesión expiró y fue cerrada automáticamente. Por favor inicie sesión nuevamente.');
        this.logout();
      } else {
        Dialog.show(InformType.Danger, this.title);
      }
    } else {
      Dialog.show(InformType.Danger, this.title, error.error.message);
    }
  }

  private applyCaptchaValidators() {
    this.personForm.get('recaptchaReactive').setValidators(Validators.required);
    this.personForm.get('recaptchaReactive').updateValueAndValidity();
  }

  private logout() {
    this.applicationService.setUserLoggedIn(false);
    this.router.navigate(['login']);
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  public readSelectedRubric(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.rubricSrc = reader.result;
      reader.readAsDataURL(file);
    }
  }

  public changeStatus2(event: any) {
    const testFile = event[Constant.ZERO_INDEX];
    this.personForm.patchValue({
      rubricFileBase64: testFile.base64,
      rubricFilename: testFile.name,
      rubricFilename2Show: StringUtil.cut(testFile.name, 42, 'Seleccione...'),
    });
    this.updateValueAndValidityRubricFields();
  }

  private updateValueAndValidityRubricFields() {
    this.personForm.get('rubricFileBase64').updateValueAndValidity();
    this.personForm.get('rubricFilename').updateValueAndValidity();
    this.personForm.get('rubricFilename2Show').updateValueAndValidity();
  }

  get defaultRubricSrc(): string | ArrayBuffer {
    return this.rubricSrc || this.placeHoldItRubric;
  }

  get placeHoldItRubric(): string {
    return 'http://placehold.it/' + this.previewRubricWidth + 'x' + this.previewRubricHeight;
  }

  get styleDimensionsRubric(): string {
    return 'width: ' + this.previewRubricWidth + 'px; height: auto';
  }

  private loadRubricSrc(person: Person) {
    if (person && person._more.rubricFileExtension && person._more.base64RubricFile) {
      this.rubricSrc = 'data:image/' + person._more.rubricFileExtension + ';base64,' + person._more.base64RubricFile;
    } else {
      this.rubricSrc = this.placeHoldItRubric;
    }
  }
}
