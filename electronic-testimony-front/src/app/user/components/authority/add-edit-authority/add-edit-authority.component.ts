import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {InformType} from '../../../../global/util/enum/InformType';
import {Authority} from '../../../model/Authority';
import {AuthorityService} from '../../../service/authority.service';
import {Module} from '../../../model/Module';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {Constant} from '../../../../global/util/Constant';

@Component({
  selector: 'app-add-edit-authority',
  templateUrl: './add-edit-authority.component.html',
  styleUrls: ['./add-edit-authority.component.css']
})
export class AddEditAuthorityComponent implements OnInit {
  public authority: Authority;
  public modules: Module[];
  public loading: boolean;
  public authorityForm: FormGroup;

  constructor(public activeModal: NgbActiveModal,
              private formBuilder: FormBuilder,
              private authorityService: AuthorityService) {
    this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.modules = LocalStorage.getModules();
    if (this.isNewAuthority) {
      this.authority.module = this.modules[0].id;
    }
  }

  public save(): void {
    this.setValuesBefore2Save();
    if (this.authorityForm.invalid) {
      Object.values(this.authorityForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.loading = true;
    if (this.isNewAuthority) {
      this.register();
    } else {
      this.edit();
    }
  }

  private setValuesBefore2Save() {
    if (this.authority.onlySuperadmin) {
      this.authority.onlySuperadmin  = +this.authority.onlySuperadmin;
    } else {
      this.authority.onlySuperadmin = Constant.NOT_ONLY_SUPERADMIN;
    }
  }

  public cancel(): void {
    this.activeModal.close();
  }

  public register() {
    this.authorityService.save(this.authority).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  public edit() {
    this.authorityService.edit(this.authority).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  get isNewAuthority(): boolean {
    return this.authority.id === undefined;
  }

  private createForm() {
    this.authorityForm = this.formBuilder.group(
      {
        module: ['', [Validators.required]],
        onlySuperadmin: [''],
        code: ['', [Validators.required]],
        description: ['', [Validators.required]],
        status: ['']
      });
  }

  public isInvalidControl(ctrlName: string) {
    return this.authorityForm.get(ctrlName).invalid && this.authorityForm.get(ctrlName).touched;
  }
}
