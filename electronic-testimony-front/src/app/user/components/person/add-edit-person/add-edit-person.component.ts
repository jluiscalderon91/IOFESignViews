import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InformType} from '../../../../global/util/enum/InformType';
import {PersonService} from '../../../service/person.service';
import {Person} from '../../../model/Person';
import {JobService} from '../../../service/job.service';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {Constant} from '../../../../global/util/Constant';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {AuthService} from '../../../service/auth/auth.service';
import {EnterpriseService} from '../../../service/enterprise.service';
import {Enterprise} from '../../../model/Enterprise';
import {Partner} from '../../../model/Partner';
import {Dialog} from '../../../../global/util/Dialog';
import {StringUtil} from '../../../../global/util/StringUtil';
import {Role} from '../../../model/Role';

@Component({
  selector: 'app-add-person',
  templateUrl: './add-edit-person.component.html',
  styleUrls: ['./add-edit-person.component.css']
})
export class AddEditPersonComponent implements OnInit {
  public entityName = 'Persona';
  public personForm: FormGroup;
  public loading: boolean;
  public participantTypes: any[] = [];
  public jobs: any[] = [];
  public enterprisesFounded: any[] = [];
  public enterprises: Enterprise[] = [];
  public partners: Partner[] = [];
  public personTypes: any[] = [];
  public participantTypeSelected: number;
  public roles: any[] = [];
  public personReceived: Person;
  public enterpriseViewSelected: Enterprise;
  public purpose4Form: number;
  public addSearchPersonSelected;
  public jobId: number;
  public identificationDocuments: any[] = [];
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public enterpriseViewnameSelected: string;
  private partnerIdSelected: number;
  public rubricSrc: string | ArrayBuffer;
  public previewRubricWidth = '235';
  public previewRubricHeight = '150';
  @ViewChild('rubricPic', {static: false}) rubricPic: ElementRef;

  constructor(public activeModal: NgbActiveModal,
              private formBuilder: FormBuilder,
              private personService: PersonService,
              private jobService: JobService,
              private authenticationService: AuthService,
              private enterpriseService: EnterpriseService,
              private modalService: NgbModal) {
    Dialog.createInstance(modalService);
    this.createForm();
  }

  ngOnInit() {
    this.configGlobalData();
    switch (this.purpose4Form) {
      case Constant.ADD:
        this.participantTypeSelected = Constant.USER;
        this.participantTypeChange();
        break;
      case Constant.EDIT:
        this.participantTypeSelected = this.personReceived._more.participantType;
        this.loadRequiredData();
        this.loadValidations();
        this.personReceived.documentType = +this.personReceived.documentType;
        this.personReceived.jobId = +this.personReceived._more.jobId;
        this.personReceived.roles = this.getFirstRole(this.personReceived._more.roles);
        this.enterpriseViewSelected.id = this.personReceived.enterpriseIdView;
        this.enterpriseViewnameSelected = this.personReceived._more.enterpriseDocumentNumberView + '-' + this.personReceived._more.enterpriseNameView;
        const rubricFilename2Show = this.personReceived._more.rubricFilename;
        this.personForm.get('rubricFilename2Show').setValue(rubricFilename2Show);
        this.loadRubricSrc(this.personReceived);
        break;
      case Constant.ADD_ON_DOCS:
        this.participantTypeSelected = Constant.INVITED;
        this.addSearchPersonSelected = String(Constant.ADD_ON_DOCS);
        this.participantTypeChange();
        break;
    }
  }

  private configGlobalData() {
    this.loadGlobalDefaultData();
    this.setGlobalDefaultData();
  }

  public participantTypeChange() {
    this.loadRequiredData();
    this.loadInitialValues();
    this.loadValidations();
  }

  public loadRequiredData() {
    this.participantTypes = LocalStorage.getParticipantTypes();
    this.personTypes = LocalStorage.getPersonTypes();
    this.identificationDocuments = LocalStorage.getIdentificationDocuments();
    this.roles = LocalStorage.getRoles();
    this.enterpriseViewSelected = new Enterprise();
    this.enterpriseViewnameSelected = '';
    this.setTypeIds(this.roles);
  }

  private setTypeIds(roles: any[]) {
    roles.forEach(role => role.id = String(role.id));
  }

  public loadInitialValues() {
    switch (this.participantTypeSelected) {
      case Constant.USER:
        this.setInitialValues4User();
        break;
      case Constant.INVITED_USER:
        this.setInitialValues4UserInvited();
        break;
      case Constant.INVITED:
        this.setInitialValues4Invited();
        break;
    }
  }

  public loadValidations() {
    switch (this.participantTypeSelected) {
      case Constant.USER:
      case Constant.INVITED_USER:
        this.personForm.get('enterpriseName').setValidators(Validators.required);
        this.personForm.get('job').setValidators(Validators.required);
        this.personForm.get('rol').setValidators(Validators.required);
        break;
      case Constant.INVITED:
        this.personForm.get('enterpriseName').clearValidators();
        this.personForm.get('job').clearValidators();
        this.personForm.get('rol').clearValidators();
        break;
    }
    this.personForm.get('enterpriseName').updateValueAndValidity();
    this.personForm.get('job').updateValueAndValidity();
    this.personForm.get('rol').updateValueAndValidity();

    switch (this.purpose4Form) {
      case Constant.ADD:
      case  Constant.EDIT:
        this.personForm.get('addSearchOpt').clearValidators();
        break;
      case Constant.ADD_ON_DOCS:
      case Constant.SEARCH_ON_DOCS:
        this.personForm.get('addSearchOpt').setValidators(Validators.required);
        break;
    }
    this.personForm.get('addSearchOpt').updateValueAndValidity();
  }

  public setInitialValues4User() {
    this.removeNaturalPersonOption();
    this.personReceived.roles = this.getRoleOf(Constant.ROLE_USER).id;
    this.personReceived.type = this.personTypes[0].id;
    this.enterpriseViewnameSelected = this.getEnterpriseViewame4User();
    this.personReceived.documentType = this.identificationDocuments[0].id;
    this.personReceived.jobId = this.jobs[0].id;
    this.personReceived.scope = Constant.USER;
  }

  public setInitialValues4UserInvited() {
    this.removeNaturalPersonOption();
    this.personReceived.roles = this.getRoleOf(Constant.ROLE_USER).id;
    this.personReceived.type = this.personTypes[0].id;
    this.personReceived.documentType = this.identificationDocuments[0].id;
    this.personReceived.jobId = this.jobs[0].id;
    this.personReceived.scope = Constant.INVITED_USER;
  }

  public setInitialValues4Invited() {
    this.personReceived.roles = '';
    this.personReceived.type = this.personTypes[Constant.ZERO_INDEX].id;
    this.personReceived.documentType = this.identificationDocuments[Constant.ZERO_INDEX].id;
    this.personReceived.jobId = this.jobs[Constant.ZERO_INDEX].id;
    this.personReceived.scope = Constant.INVITED;
  }

  public getRoleOf(roleName: string) {
    return this.roles.find(role => role.name === roleName);
  }

  private upperCase2Fields() {
    this.personReceived.firstname = this.personReceived.firstname.toUpperCase();
    this.personReceived.lastname = this.personReceived.lastname.toUpperCase();
  }

  public getEnterpriseViewame4User(): string {
    if (this.hasRole(this.ROLE_PARTNER) || this.hasRole(this.ROLE_SUPERADMIN)) {
      const enterprise: Enterprise = this.findBy(this.personReceived.enterpriseId);
      return enterprise.documentNumber + ' - ' + enterprise.name;
    }
    return LocalStorage.getEnterpriseDocumentNumberView() + ' - ' + LocalStorage.getEnterpriseNameView();
  }

  private findBy(entepriseId): Enterprise {
    return this.enterprises.find(value => value.id === entepriseId);
  }

  public removeNaturalPersonOption() {
    const index = this.getIndexPersonTypeOf(Constant.NATURAL_PERSON);
    if (index >= 0) {
      this.personTypes.splice(index, 1);
    }
  }

  private getIndexPersonTypeOf(personType: any): number {
    return this.personTypes.findIndex(value => value.id === personType);
  }

  get isUserParticipant(): boolean {
    return Constant.USER === this.participantTypeSelected;
  }

  get isInvitedParticipant(): boolean {
    return Constant.INVITED === this.participantTypeSelected;
  }

  public save() {
    console.log(this.personForm);
    if (this.personForm.invalid) {
      this.markAsTouchedAllControls();
      return;
    }
    this.upperCase2Fields();
    switch (this.purpose4Form) {
      case Constant.ADD:
        this.register();
        break;
      case Constant.EDIT:
        this.edit();
        break;
      case Constant.ADD_ON_DOCS:
        this.register2();
        break;
      case Constant.SEARCH_ON_DOCS:
        if (this.personReceived.id) {
          this.activeModal.close(this.personReceived);
        }
        break;
    }
  }

  private markAsTouchedAllControls() {
    Object.values(this.personForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private markAsUntouchedAllControls() {
    Object.values(this.personForm.controls).forEach(control => {
      control.markAsUntouched();
    });
  }

  public register() {
    this.setFinalValuesBefore2Save();
    this.loading = true;
    this.personService.save(this.personReceived).subscribe(person => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      if (error.status === HttpStatusCode.FOUND) {
        this.activeModal.close(InformType.Warning);
      } else {
        this.activeModal.close(InformType.Danger);
      }
    });
  }

  public register2() {
    this.setFinalValuesBefore2Save();
    this.loading = true;
    this.personService.save(this.personReceived).subscribe(person => {
      this.loading = false;
      this.activeModal.close(person);
    }, error => {
      this.loading = false;
      if (error.status === HttpStatusCode.FOUND) {
        this.activeModal.close(error.error);
        Dialog.show(InformType.Warning, 'Persona');
      } else {
        this.activeModal.close(InformType.Danger);
      }
    });
  }

  public setFinalValuesBefore2Save() {
    switch (this.participantTypeSelected) {
      case Constant.USER:
        if (this.enterpriseViewSelected.id) {
          this.personReceived.enterpriseIdView = this.enterpriseViewSelected.id;
        } else {
          this.personReceived.enterpriseIdView = LocalStorage.getEnterpriseIdView();
        }
        break;
      case Constant.INVITED_USER:
        this.personReceived.enterpriseIdView = this.enterpriseViewSelected.id;
        break;
      case Constant.INVITED:
        if (!this.isNaturalPerson) {
          this.personReceived.enterpriseIdView = this.enterpriseViewSelected.id;
        }
        break;
    }
    if (this.isNaturalPerson) {
      this.personReceived.roles = '';
      this.personReceived.jobId = Constant.DEFAULT_JOB_ID;
      this.personReceived.enterpriseIdView = Constant.DEFAULT_ENTERPRISE_ID_VIEW;
    }
    this.personReceived.rubricBase64Data = this.personForm.get('rubricFileBase64').value;
    this.personReceived.rubricFilename = this.personForm.get('rubricFilename').value;
  }

  public edit() {
    this.setFinalValuesBefore2Save();
    this.loading = true;
    this.personReceived.scope = this.participantTypeSelected;
    this.personService.edit(this.personReceived).subscribe(person => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  get isNewPerson(): boolean {
    return this.personReceived.id === undefined;
  }

  public cancel() {
    this.activeModal.close(-1);
  }

  public loadEnterprises(event: any) {
    const nameOrDocnumber = event.target.value;
    if (nameOrDocnumber) {
      if (nameOrDocnumber.length > 3) {
        const findDistinctUrl = Constant.ROOT_API_V1
          .concat('/participants/')
          .concat(String(this.participantTypeSelected))
          .concat('/enterprises/')
          .concat(String(this.personReceived.enterpriseId))
          .concat('/distinct')
          .concat('?findby=')
          .concat(nameOrDocnumber);
        this.enterpriseService.get(findDistinctUrl).subscribe((next: any) => {
          if (next._embedded) {
            this.enterprisesFounded = next._embedded.enterprises;
          }
        });
      }
    }
  }

  get isNaturalPerson(): boolean {
    return Constant.NATURAL_PERSON === this.personReceived.type;
  }

  public search() {
    if (this.personForm.controls.enterpriseName.invalid
      || this.personForm.controls.documentType.invalid
      || this.personForm.controls.documentNumber.invalid
      || this.personForm.controls.job.invalid
      || !this.enterpriseViewSelected) {
      this.personForm.controls.enterpriseName.markAsTouched();
      this.personForm.controls.documentType.markAsTouched();
      this.personForm.controls.documentNumber.markAsTouched();
      this.personForm.controls.job.markAsTouched();
      return;
    }
    this.setFinalValuesBefore2Save();
    const enterpriseId = this.getEnterpriseId2Search();
    const enterpriseIdView = this.personReceived.enterpriseIdView;
    const participantType = this.personReceived.scope;
    const personType = this.personReceived.type;
    const documentType = this.personReceived.documentType;
    const documentNumber = this.personReceived.documentNumber;
    const jobId = this.personReceived.jobId;
    this.loading = true;
    const urlSearch = Constant.ROOT_API_V1
      .concat('/enterprises/')
      .concat(String(enterpriseId))
      .concat('/enterprises/')
      .concat(String(enterpriseIdView))
      .concat('/participanttypes/')
      .concat(String(participantType))
      .concat('/persontype/')
      .concat(String(personType))
      .concat('/documenttype/')
      .concat(String(documentType))
      .concat('/documentnumber/')
      .concat(documentNumber)
      .concat('/jobs/')
      .concat(String(jobId))
      .concat('/people');
    this.personService.get(urlSearch).subscribe((person: any) => {
      this.personReceived.id = person.id;
      this.personReceived.firstname = person.firstname;
      this.personReceived.lastname = person.lastname;
      this.personReceived.email = person.email;
      this.personReceived.documentType = +person.documentType;
      this.personReceived.jobId = person._more.jobId;
      this.personReceived.fullname = person.fullname;
      this.personForm.get('rubricFilename2Show').setValue(person._more.rubricFilename);
      this.loadRubricSrc(person);
      this.loading = false;
    }, error => {
      this.loading = false;
      if (error.status === HttpStatusCode.NOT_FOUND) {
        this.personReceived.id = undefined;
        this.personReceived.fullname = '';
        this.personReceived.firstname = '';
        this.personReceived.lastname = '';
        this.personReceived.email = '';
        Dialog.show(InformType.Info, 'Persona');
      } else {
        this.loadInitialValues();
        Dialog.show(InformType.Danger, 'Persona');
        return;
      }
    });
  }

  private loadRubricSrc(person: Person) {
    if (person && person._more.rubricFileExtension && person._more.base64RubricFile) {
      this.rubricSrc = 'data:image/' + person._more.rubricFileExtension + ';base64,' + person._more.base64RubricFile;
    } else {
      this.rubricSrc = this.placeHoldItRubric;
    }
  }

  private getEnterpriseId2Search(): number {
    if (this.personReceived.enterpriseId === undefined) {
      return LocalStorage.getEnterpriseIdView();
    } else {
      return this.personReceived.enterpriseId;
    }
  }

  public onEnterpriseChanged(data: string) {
    if (data.includes(' - ')) {
      const documentNumber = data.split('-')[0].trim();
      this.enterpriseViewSelected = this.enterprisesFounded.find(enterprise => enterprise.documentNumber === documentNumber);
      if (this.enterpriseViewSelected) {
      } else {
        this.personForm.controls.enterpriseName.setErrors({errorEnterpriseName: true});
      }
    } else {
      this.personForm.controls.enterpriseName.setErrors({errorEnterpriseName: true});
    }
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  public createForm() {
    this.personForm = this.formBuilder.group(
      {
        partner: [''],
        enterprise: [''],
        addSearchOpt: ['', Validators.required],
        type: ['', [Validators.required]],
        documentType: ['', Validators.required],
        documentNumber: ['', [Validators.required]],
        firstname: ['', Validators.compose([Validators.required,
          Validators.pattern('^[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]{3,40}')])],
        lastname: ['', Validators.compose([Validators.required,
          Validators.pattern('^[a-zA-ZñÑáéíóúÁÉÍÓÚ\\s]{3,60}')])],
        groupRadio: ['', Validators.required],
        email: ['', Validators.compose([Validators.required,
          Validators.pattern('^([a-zA-Z0-9_\\-\\.]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([a-zA-Z0-9\\-]+\\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\\]?)$')])],
        rol: ['', Validators.required],
        phoneNumber: [''],
        enterpriseName: ['', Validators.required],
        status: [''],
        job: ['', Validators.required],
        rubricFileId: [''],
        rubricFileBase64: [''],
        rubricFilename: [''],
        rubricFilename2Show: [''],
      });
  }

  public isInvalidControl(ctrlName: string) {
    return this.personForm.get(ctrlName).invalid && this.personForm.get(ctrlName).touched;
  }

  public onChangeDocType() {
    const documentType = this.personReceived.documentType;
    switch (documentType) {
      case Constant.DNI:
        this.personForm.get('documentNumber').setValidators(
          Validators.compose(
            [
              Validators.required,
              Validators.pattern('^[0-9]{8}')])
        );
        break;
      case Constant.CARNE_EXTRANJERIA:
        this.personForm.get('documentNumber').setValidators(
          Validators.compose(
            [
              Validators.required,
              Validators.pattern('^[0-9]{9,11}')])
        );
        break;
      case Constant.PASSAPORTE:
        this.personForm.get('documentNumber').setValidators(
          Validators.compose(
            [
              Validators.required,
              Validators.pattern('^[a-zA-Z0-9]{3,20}')])
        );
        break;
    }
    this.personForm.get('documentNumber').updateValueAndValidity();
  }

  get documentNumber() {
    return this.personForm.get('documentNumber');
  }

  public getErrorMessageBy(controlName: string): string {
    const control = this.personForm.get(controlName);
    const hasRequiredError = control.hasError('required');
    const hasPatternError = control.hasError('pattern');
    let actualValue;
    switch (controlName) {
      case 'documentNumber':
        if (hasRequiredError) {
          return ' Ingrese el '
            .concat(this.getDescriptionOfDocumentTypeBy(this.personReceived.documentType))
            .concat(' requerido');
        } else if (hasPatternError) {
          actualValue = control.errors.pattern.actualValue;
          return '\''
            .concat(String(actualValue))
            .concat('\' no cumple con el formato necesario de un ')
            .concat(this.getDescriptionOfDocumentTypeBy(this.personReceived.documentType));
        }
        break;
      case 'email':
        if (hasRequiredError) {
          return 'El correo electrónico es  requerido';
        } else if (hasPatternError) {
          actualValue = control.errors.pattern.actualValue;
          return '\''
            .concat(String(actualValue))
            .concat('\' no cumple con el formato necesario de un correo electrónico');
        }
        break;
    }
  }

  public getDescriptionOfDocumentTypeBy(id: number) {
    return this.identificationDocuments.find(documentType => documentType.id === id).shortdescription;
  }

  public cleanDataAfterChanges() {
    this.personReceived.firstname = '';
    this.personReceived.lastname = '';
    this.personReceived.email = '';
    this.personForm.get('rubricFilename2Show').setValue('');
    this.personForm.get('rubricFileBase64').setValue('');
    this.loadRubricSrc(undefined);
  }

  public onChangePersonTypes() {
    this.reloadValidations();
    if (this.purpose4Form === Constant.SEARCH_ON_DOCS || this.purpose4Form === Constant.ADD_ON_DOCS) {
      this.personReceived.jobId = this.jobs[0].id;
    }
  }

  private reloadValidations() {
    if (this.isNaturalPerson) {
      this.personForm.get('enterpriseName').clearValidators();
      this.personForm.get('job').clearValidators();
    } else {
      this.personForm.get('enterpriseName').setValidators(Validators.required);
      this.personForm.get('job').setValidators(Validators.required);
    }
    this.personForm.get('enterpriseName').updateValueAndValidity();
    this.personForm.get('job').updateValueAndValidity();
  }

  public getFirstRole(roles: string) {
    return roles.split(',')[0];
  }

  public onAddSearchChange() {
    this.personReceived = new Person();
    this.personForm.get('rubricFilename2Show').setValue('');
    this.personForm.get('rubricFileBase64').setValue('');
    this.loadRubricSrc(undefined);
    this.participantTypeChange();
    this.markAsUntouchedAllControls();
    switch (+this.addSearchPersonSelected) {
      case Constant.ADD_ON_DOCS:
        this.purpose4Form = Constant.ADD_ON_DOCS;
        break;
      case Constant.SEARCH_ON_DOCS:
        this.purpose4Form = Constant.SEARCH_ON_DOCS;
        break;
    }
    this.personReceived.enterpriseId = LocalStorage.getEnterpriseIdView();
    this.personReceived.partnerId = LocalStorage.getPartnerId();
  }

  public showByAddOrSearchType(participantType: any) {
    if (this.showMoreOptionsOfAddSearchOnDocs) {
      if (Constant.USER === participantType.id || Constant.INVITED_USER === participantType.id) {
        return false;
      }
      return true;
    }
    return true;
  }

  get showMoreOptionsOfAddSearchOnDocs(): boolean {
    return this.purpose4Form === Constant.ADD_ON_DOCS || this.purpose4Form === Constant.SEARCH_ON_DOCS;
  }

  get disableOnSearchOptSelected(): boolean {
    return Constant.SEARCH_ON_DOCS !== this.purpose4Form;
  }

  get disableOnEditOptSelected(): boolean {
    return Constant.EDIT === this.purpose4Form;
  }

  public reloadData() {
    // this.personReceived.enterpriseId = this.enterprises[0].id;
    switch (this.participantTypeSelected) {
      case Constant.USER:
        this.enterpriseViewSelected = this.findBy(this.personReceived.enterpriseId);
        this.enterpriseViewnameSelected = this.getEnterpriseViewame4User();
        break;
      case Constant.INVITED_USER:
        if (Constant.ADD === this.purpose4Form) {
          this.enterpriseViewnameSelected = '';
        }
        break;
      case Constant.INVITED:
        break;
    }
    this.jobs = LocalStorage.getJobsBy(this.personReceived.enterpriseId);
    this.personReceived.jobId = this.jobs[0].id;
  }

  private loadGlobalDefaultData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partners = LocalStorage.getPartners();
      if (!this.isNewPerson) {
        this.enterprises = this.getEnterprises(this.personReceived.partnerId);
        this.jobs = LocalStorage.getJobsBy(this.personReceived.enterpriseId);
      }
    } else if (this.hasRole(this.ROLE_PARTNER)) {
      const partnerId = LocalStorage.getPartnerId();
      this.enterprises = this.getEnterprises(partnerId);
    } else {
      const enterpriseId = LocalStorage.getEnterpriseIdView();
      this.jobs = LocalStorage.getJobsBy(enterpriseId);
    }
  }

  private setGlobalDefaultData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      if (this.isNewPerson) {
        this.personReceived.partnerId = this.partners[Constant.ZERO_INDEX].id;
        this.enterprises = this.getEnterprises(this.personReceived.partnerId);
        this.personReceived.enterpriseId = this.enterprises[Constant.ZERO_INDEX].id;
        this.jobs = LocalStorage.getJobsBy(this.personReceived.enterpriseId);
        if (this.jobs.length > 0) {
          this.personReceived.jobId = this.jobs[Constant.ZERO_INDEX].id;
        }
      }
    } else if (this.hasRole(this.ROLE_PARTNER)) {
      if (this.isNewPerson) {
        // TODO Revisar aquí, cuando intenta registrar como partner, NO LO PERMITE
        const initialEnterprise = this.enterprises.find(value => value.id === LocalStorage.getEnterpriseId());
        this.personReceived.enterpriseId = initialEnterprise.id;
      }
      this.jobs = LocalStorage.getJobsBy(this.personReceived.enterpriseId);
      if (this.isNewPerson) {
        this.personReceived.jobId = this.jobs[0].id;
      }
      this.personReceived.partnerId = LocalStorage.getPartnerId();
    } else {
      this.personReceived.enterpriseId = LocalStorage.getEnterpriseIdView();
      this.personReceived.partnerId = LocalStorage.getPartnerId();
    }
    // this.reloadEnterprises();
  }

  public reloadEnterprises() {
    this.partnerIdSelected = this.personReceived.partnerId;
    this.enterprises = this.getEnterprises(this.partnerIdSelected);
    this.personReceived.enterpriseId = this.enterprises[Constant.ZERO_INDEX].id;
    this.reloadData();
    // this.applyEnterpriseValidators();
    //todo AL SELECCIONAR ROL PARTNER -> PARTNER Y SELECCIONAR LA EMPE4SA
  }

  private getEnterprises(partnerId: number): Enterprise[] {
    return LocalStorage.getEnterprises().filter(value => partnerId === value.partnerId && Constant.NOT_EXCLUDED === value.excluded);
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

  public readSelectedRubric(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.rubricSrc = reader.result;
      reader.readAsDataURL(file);
    }
  }

  get defaultRubricSrc(): string | ArrayBuffer {
    return this.rubricSrc || this.placeHoldItRubric;
  }

  get placeHoldItRubric(): string {
    return 'http://placehold.it/' + this.previewRubricWidth + 'x' + this.previewRubricHeight;
  }

  private updateValueAndValidityRubricFields() {
    this.personForm.get('rubricFileBase64').updateValueAndValidity();
    this.personForm.get('rubricFilename').updateValueAndValidity();
    this.personForm.get('rubricFilename2Show').updateValueAndValidity();
  }

  get styleDimensionsRubric(): string {
    return 'width: ' + this.previewRubricWidth + 'px; height: auto';
  }

  public applyEnterpriseValidators(): void {
    const selectedRole: Role = this.roles.find(value => value.id === this.personReceived.roles);
    const control: AbstractControl = this.personForm.get('enterprise');
    if (this.ROLE_PARTNER === selectedRole.name) {
      const selectedEnterprise: Enterprise = this.enterprises.find(value => value.id === this.personReceived.enterpriseId);
      if (selectedEnterprise.isPartner) {
        control.setErrors(null);
        console.log('es partner');
      } else {
        control.setErrors({isntPartner: true});
        control.markAsTouched();
        console.log('No es partner');
      }
    } else {
      console.log('No está seleccionado rol partner');
      control.setErrors(null);
    }
  }
}

