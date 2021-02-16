import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {InformType} from '../../../../global/util/enum/InformType';
import {Role} from '../../../model/Role';
import {RoleService} from '../../../service/role.service';

@Component({
  selector: 'app-add-edit-role',
  templateUrl: './add-edit-role.component.html',
  styleUrls: ['./add-edit-role.component.css']
})
export class AddEditRoleComponent implements OnInit {
  public role: Role;
  public loading: boolean;
  public roleForm: FormGroup;

  constructor(public activeModal: NgbActiveModal,
              private formBuilder: FormBuilder,
              private roleService: RoleService) {
    this.createForm();
  }

  ngOnInit() {
  }

  public save(): void {
    if (this.roleForm.invalid) {
      Object.values(this.roleForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }
    this.loading = true;
    if (this.isNewRole) {
      this.register();
    } else {
      this.edit();
    }
  }

  public cancel(): void {
    this.activeModal.close();
  }

  public register() {
    this.roleService.save(this.role).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  public edit() {
    this.roleService.edit(this.role).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }


  get isNewRole(): boolean {
    return this.role.id === undefined;
  }

  private createForm() {
    this.roleForm = this.formBuilder.group(
      {
        name: ['', [Validators.required]],
        abbreviation: ['', [Validators.required]],
        description: ['', [Validators.required]],
        status: ['']
      });
  }

  public isInvalidControl(ctrlName: string) {
    return this.roleForm.get(ctrlName).invalid && this.roleForm.get(ctrlName).touched;
  }
}
