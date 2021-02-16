import {Component, OnInit} from '@angular/core';
import {User} from '../../model/User';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../service/auth/auth.service';
import HttpStatusCode from '../../../global/util/HttpStatusCode';
import {InformType} from '../../../global/util/enum/InformType';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Constant} from '../../../global/util/Constant';
import {ApplicationService} from '../../service/application.service';
import {Dialog} from '../../../global/util/Dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public user = new User();
  public userForm: FormGroup;
  private returnUrl: string;
  public loading: boolean;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private authenticationService: AuthService,
              private modalService: NgbModal,
              private applicationService: ApplicationService) {
    Dialog.createInstance(modalService);
    this.createForm();
  }

  ngOnInit() {
    this.authenticationService.logout();
    this.returnUrl = this.router.paramsInheritanceStrategy.anchor('returnUrl' || '/');
  }

  login(user: User) {
    if (this.userForm.invalid) {
      Object.values(this.userForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.loading = true;
    this.authenticationService.login(user).subscribe(data => {
      this.loading = false;
      const onlyApi = data.headers.headers.get('onlyapi')[Constant.ZERO_INDEX];
      if (Constant.ONLY_API_OPTION === onlyApi) {
        Dialog.show(InformType.Info, 'Login', 'El usuario no tiene los permisos necesarios para acceder a la bandeja');
        return;
      }
      this.applicationService.setUserLoggedIn(true);
      this.loadStaticData();
    }, error => {
      this.loading = false;
      this.applicationService.setUserLoggedIn(false);
      if (error.status === HttpStatusCode.UNAUTHORIZED) {
        Dialog.show(InformType.Warning, 'Login', 'Problemas de permisos en el acceso.');
      } else if (error.status === HttpStatusCode.FORBIDDEN) {
        Dialog.show(InformType.Warning, 'Login', 'Sus credenciales de acceso son incorrectas.');
      } else {
        Dialog.show(InformType.Danger, 'Login');
      }
    });
  }

  private createForm() {
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  public isInvalidControl(ctrlName: string) {
    return this.userForm.get(ctrlName).invalid && this.userForm.get(ctrlName).touched;
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  private loadStaticData() {
    this.loading = true;
    const url = Constant.ROOT_API_V1.concat('/staticdata');
    this.applicationService.get(url).subscribe((value: any) => {
      this.loading = false;
      localStorage.setItem('_embedded', JSON.stringify(value));
      if (!this.hasRole(this.ROLE_SUPERADMIN)) {
        this.router.navigate(['document']);
      } else {
        this.router.navigate(['enterprise']);
      }
    }, error => {
      Dialog.show(InformType.Danger, 'Inicio', 'Error loadign initial data');
    });
  }
}
