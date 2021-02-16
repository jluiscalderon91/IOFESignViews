import {Component, OnInit} from '@angular/core';
import {Constant} from '../../../global/util/Constant';
import {VerifierService} from '../../../user/service/verifier.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {InformType} from '../../../global/util/enum/InformType';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import HttpStatusCode from '../../../global/util/HttpStatusCode';
import {Dialog} from '../../../global/util/Dialog';
import {Document} from '../../../user/model/Document';
import {DocumentState} from '../../../global/util/DocumentState';
import {Documentmodification} from '../../../user/model/Documentmodification';

@Component({
  selector: 'app-vifierbycode',
  templateUrl: './verifierbycode.component.html',
  styleUrls: ['./verifierbycode.component.css']
})
export class VerifierbycodeComponent implements OnInit {

  public verifybycodeForm: FormGroup;
  public operatorsInfo: any[] = [];
  public urlStream;
  public loading: boolean;
  private entityName = 'Verificación';
  public wrongVerification = true;
  public resumeHashResource: string;
  public document: Document;
  public documentmodifications: Documentmodification[] = [];
  public urlLastDocumentResource: string;

  constructor(private verifierService: VerifierService,
              private modalService: NgbModal,
              private formBuilder: FormBuilder) {
    Dialog.createInstance(modalService);
  }

  ngOnInit() {
    this.createForm();
  }

  private createForm() {
    this.verifybycodeForm = this.formBuilder.group(
      {
        resumeHash: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])]
      });
  }

  public verify() {
    if (this.verifybycodeForm.invalid) {
      this.markAsTouchedAllControls();
      return;
    }
    this.loadOperatorsInfo(this.resumeHashResource);
  }

  private loadOperatorsInfo(resumeHash: string) {
    const urlVerifier = Constant.ROOT_API_V1.concat('/public/documents/resources/')
      .concat(resumeHash)
      .concat('/verifier');

    this.urlStream = Constant.ROOT_API_V1.concat('/public/documents/resources/')
      .concat(resumeHash)
      .concat('/stream');

    this.loading = true;
    this.verifierService.get(urlVerifier).subscribe((next: any) => {
      this.loading = false;
      this.operatorsInfo = next._embedded.operatorsInfo;
      this.documentmodifications = next._embedded.documentmodifications;
      this.urlLastDocumentResource = next._embedded.urlLastDocumentResource;
      this.wrongVerification = false;
      this.document = next._embedded.document;
    }, error => {
      // TODO investigate and improvement next treatment for it doesn't get 404
      if (error.status) {
        this.wrongVerification = true;
        if (HttpStatusCode.NOT_FOUND === error.status) {
          Dialog.show(InformType.Info, this.entityName, error.error.message);
        } else {
          Dialog.show(InformType.Danger, this.entityName);
        }
        this.loading = false;
      }
    });
  }

  public isInvalidControl(ctrlName: string) {
    return this.verifybycodeForm.get(ctrlName).invalid && this.verifybycodeForm.get(ctrlName).touched;
  }

  private markAsTouchedAllControls() {
    Object.values(this.verifybycodeForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  public getErrorMessageBy(controlName: string): string {
    const control = this.verifybycodeForm.get(controlName);
    const hasRequiredError = control.hasError('required');
    const hasnotRequiredSizeError = control.hasError('minlength') || control.hasError('maxlength');
    const hasPatternError = control.hasError('pattern');
    let actualValue;
    let requiredValue;
    if (hasRequiredError) {
      return ' Ingrese el código requerido';
    } else if (hasPatternError) {
      actualValue = control.errors.pattern.actualValue;
      return '\''
        .concat(String(actualValue))
        .concat('\' no cumple con el formato necesario de un ')
        .concat('código de verificación');
    } else if (hasnotRequiredSizeError) {
      actualValue = control.value;
      requiredValue = control.errors.minlength ? control.errors.minlength.requiredLength : control.errors.maxlength ? control.errors.maxlength.requiredLength : -1;
      return '\''
        .concat(String(actualValue))
        .concat('\' no cumple con el tamaño necesario de un ')
        .concat('código de verificación de ')
        .concat(requiredValue)
        .concat(' caracteres.');
    }
  }

  public cleanForm() {
    this.urlStream = {};
    this.operatorsInfo = [];
  }

  get showTableOperatorsInfo(): boolean {
    return !this.wrongVerification && (this.operatorsInfo.length !== 0);
  }

  get isCanceled(): boolean {
    if (this.document === undefined) {
      return false;
    }
    return Constant.FINISHED === this.document.finished && DocumentState.CANCELED === this.document.stateId;
  }

  get isModified(): boolean {
    if (this.document === undefined) {
      return false;
    }
    return Constant.FINISHED === this.document.finished && DocumentState.MODIFIED === this.document.stateId;
  }

  get isReplacerFinished(): boolean {
    const maxIndex = this.documentmodifications.length - 1;
    const replacer: Document = this.documentmodifications[maxIndex].documentByDocumentIdNew;
    return Constant.FINISHED === replacer.finished;
  }
}
