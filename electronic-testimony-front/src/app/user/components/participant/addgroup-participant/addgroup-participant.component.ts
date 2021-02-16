import {Component, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ParticipantService} from '../../../service/participant.service';
import {Participant} from '../../../model/Participant';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {InformType} from '../../../../global/util/enum/InformType';
import {AddEditPersonComponent} from '../../person/add-edit-person/add-edit-person.component';
import {Person} from '../../../model/Person';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {Constant} from '../../../../global/util/Constant';
import {AuthService} from '../../../service/auth/auth.service';
import {GroupParticipant} from '../../../model/GroupParticipant';
import {NotifyPostOperationComponent} from '../notify-post-operation/notify-post-operation.component';
import {SieemailService} from '../../../service/sieemail.service';
import {Sieemail} from '../../../model/Sieemail';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-addgroup-participant',
  templateUrl: './addgroup-participant.component.html',
  styleUrls: ['./addgroup-participant.component.css']
})
export class AddgroupParticipantComponent implements OnInit {
  public participantForm: FormGroup;
  public loading: boolean;
  public deletedParticipants: any[] = [];
  public participant = new Participant();
  public workflowReceived: any;
  public selectedPerson = new Person();
  public people: any;
  public personFullName: string;
  public groupParticipant = new GroupParticipant();
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public ROLE_USER = Constant.ROLE_USER;
  private lastParticipanttypeSelected = Constant.USER;
  public enterpriseRecived: any;
  private enterpriseIdSelected: number;
  public operations: any[] = [];
  public wasSelectedPersonAfterSearch: boolean;
  public title = 'Participantes';
  public entityName = 'Participante';

  constructor(private activeModal: NgbActiveModal,
              private participantService: ParticipantService,
              private formBuilder: FormBuilder,
              private modalService: NgbModal,
              public authenticationService: AuthService,
              private sieemailService: SieemailService) {
    Dialog.createInstance(modalService);
    this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.setDefaultValuesOfAddedParticipant();
  }

  private loadInitialData() {
    this.operations = LocalStorage.getOperations();
    this.getParticipants(this.workflowReceived);
  }

  private setDefaultValuesOfAddedParticipant() {
    this.participant.participantType = this.lastParticipanttypeSelected;
    this.participant.operationId = this.operations[0].id;
    this.participant.sendAlert = Constant.SEND_ALERT;
    this.participant._more.personFullName = '-';
    if (this.hasRole(this.ROLE_PARTNER)) {
      this.enterpriseIdSelected = this.workflowReceived.enterpriseId;
    } else {
      this.enterpriseIdSelected = this.authenticationService.getEnterpriseIdView();
    }
    this.personFullName = '';
    this.participant.addTsa = Constant.NOT_ADD_TSA;
    this.participant.sendNotification = Constant.NOT_SEND_NOTIFICATION;
    this.participant.digitalSignature = true;
    this.markAsUntouchedAllControls();
    this.people = [];
    switch (this.lastParticipanttypeSelected) {
      case Constant.USER:
      case Constant.INVITED_USER:
        this.wasSelectedPersonAfterSearch = false;
        break;
      case Constant.INVITED:
        this.wasSelectedPersonAfterSearch = true;
        this.participant.personId = Constant.DEFAULT_PERSON_ID;
        this.participant._more.jobDescription = '-';
        break;
    }
  }

  public save() {
    this.setValuesBefore2Save();
    if (this.isNewGroup) {
      this.register();
    } else {
      this.edit();
    }
  }

  private register() {
    this.loading = true;
    this.participantService.saveGroup(this.groupParticipant).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  private edit() {
    this.loading = true;
    this.participantService.editGroup(this.groupParticipant).subscribe(next => {
      this.loading = false;
      this.activeModal.close(InformType.Success);
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  get isNewGroup(): boolean {
    return !this.existSomeRegisteredParticipants;
  }

  get existSomeRegisteredParticipants(): boolean {
    return !(this.groupParticipant.participants.find(participant => participant.id !== undefined) === undefined);
  }

  private setValuesBefore2Save() {
    this.groupParticipant.workflowId = this.workflowReceived.id;
    const participants: Participant[] = this.arrayParticipant.controls.map(control => this.buildParticipantOf(control));
    this.setOrderOf(participants);
    this.addDeletedParticipantsTo(participants);
    this.groupParticipant.participants = participants;
  }

  private buildParticipantOf(control: AbstractControl): Participant {
    return {
      id: control.get('id').value,
      workflowId: null,
      operationId: control.get('operationId').value,
      personId: control.get('personId').value,
      participantType: control.get('participantType').value,
      orderParticipant: null,
      createAt: null,
      active: this.getData(control.get('active').value),
      addTsa: this.getData(control.get('addTsa').value),
      addTsa1: this.getData(control.get('addTsa1').value),
      sendAlert: this.getData(control.get('sendAlert').value),
      sendAlert1: this.getData(control.get('sendAlert1').value),
      sendAlert2: this.getData(control.get('sendAlert2').value),
      sendNotification: this.getData(control.get('sendNotification').value),
      sendNotification1: this.getData(control.get('sendNotification1').value),
      sendNotification2: this.getData(control.get('sendNotification2').value),
      personFullName: null,
      observation: null,
      uploadRubric: this.getData(control.get('uploadRubric').value),
      digitalSignature: this.getData(control.get('digitalSignature').value),
      typeElectronicSignature: this.getData(control.get('typeElectronicSignature').value),
      _more: null
    };
  }

  private getData(controlValue: any): any {
    if (controlValue) {
      if (controlValue === 1 || controlValue === true) {
        return Constant.ON;
      } else {
        return Constant.OFF;
      }
    } else {
      return Constant.OFF;
    }
  }

  private setOrderOf(participants: Participant[]) {
    for (let index = 0; index < participants.length; index++) {
      participants[index].orderParticipant = index + 1;
    }
  }

  private addDeletedParticipantsTo(participants: Participant[]) {
    this.deletedParticipants.forEach(participant => participants.push(participant));
  }

  public cancel() {
    this.activeModal.close(AddgroupParticipantComponent);
  }

  public addParticipant() {
    this.addItem2ArrayParticipant(this.participant);
    this.participant = new Participant();
    this.setDefaultValuesOfAddedParticipant();
  }

  public delete(index: number) {
    const control: AbstractControl = this.arrayParticipant.at(index);
    const participant: Participant = this.buildParticipantOf(control);
    if (participant.id) {
      participant.active = Constant.INACTIVE;
      this.deletedParticipants.push(participant);
    }
    this.arrayParticipant.removeAt(index);
  }

  public search(data: any) {
    this.people = [];
    const fullname = data.target.value;
    if (fullname.length > 3) {
      this.participantService.search(this.enterpriseIdSelected, this.participant.participantType, fullname).subscribe((next: any) => {
        if (next._embedded) {
          this.people = next._embedded.people;
        }
      });
    }
  }

  get isNotFull(): boolean {
    return this.arrayParticipant.length !== this.workflowReceived.maxParticipants;
  }

  get hasnotMiniumParticipants(): boolean {
    return this.arrayParticipant.length < Constant.MINIMUM_PARTICIPANTS;
  }

  private createForm() {
    this.participantForm = this.formBuilder.group(
      {
        groupRadio: ['', [Validators.required]],
        operation: ['', [Validators.required]],
        personName: ['', [Validators.required]],
        digitalSignature: [true],
        tsa: [''],
        tsa1: [''],
        sendAlert: [''],
        sendAlert1: [''],
        sendAlert2: [''],
        sendNotification: [''],
        sendNotification1: [''],
        sendNotification2: [''],
        uploadRubric: [''],
        groupTypeElectronicSignatureRadio: [''],
        state: [''],
        arrayParticipant: this.formBuilder.array([])
      });
  }

  public onPersonChanged(personNameSelected) {
    const listElement = personNameSelected.split('-');
    const documentNumber = listElement[Constant.ZERO_INDEX].trim();
    this.selectedPerson = this.getPersonSelectedBy(documentNumber);
    if (this.selectedPerson) {
      this.participant.personId = this.selectedPerson.id;
      this.participant._more.personFullName = this.selectedPerson.fullname;
      this.participant._more.jobDescription = this.selectedPerson._more.jobDescription;
      this.wasSelectedPersonAfterSearch = true;
    } else {
      this.wasSelectedPersonAfterSearch = false;
    }
  }

  public getPersonSelectedBy(documentNumber: string): any {
    return this.people.find(person => person.documentNumber === documentNumber);
  }

  openModalAddPerson() {
    const modalRef = this.modalService.open(AddEditPersonComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.enterpriseIdSelected = this.workflowReceived.enterpriseId;
    modalRef.componentInstance.enterpriseRecived = this.enterpriseRecived;
    modalRef.componentInstance.person = new Person();
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        Dialog.show(InformType.Success, 'Person');
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, 'Person');
      }
    });
  }

  public isInvalidControl(ctrlName: string) {
    return this.participantForm.get(ctrlName).invalid && this.participantForm.get(ctrlName).touched;
  }

  public getParticipants(workflow: any) {
    this.loading = true;
    this.participantService.getParticipants(workflow.id).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        const participants = next._embedded.participants;
        this.fillArrayParticipant(participants);
      }
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  private fillArrayParticipant(participants: Participant[]) {
    participants.forEach(participant => {
      this.addItem2ArrayParticipant(participant);
    });
  }

  private addItem2ArrayParticipant(participant: Participant) {
    console.log(participant);
    const control = this.formBuilder.group({
      id: [participant.id],
      personId: participant.personId,
      participantType: participant.participantType,
      personFullname: participant._more.personFullName,
      jobDescription: participant._more.jobDescription,
      operationId: participant.operationId,
      addTsa: participant.addTsa === 1 || participant.addTsa1 === 1 ? Constant.ADD_TSA : Constant.NOT_ADD_TSA,
      addTsa1: Constant.NOT_ADD_TSA,
      sendAlert: participant.sendAlert === 1 || participant.sendAlert1 === 1 || participant.sendAlert2 === 1 ? Constant.SEND_ALERT : Constant.NOT_SEND_ALERT,
      sendAlert1: Constant.NOT_SEND_ALERT,
      sendAlert2: Constant.NOT_SEND_ALERT,
      sendNotification: participant.sendNotification === 1 || participant.sendNotification1 === 1 || participant.sendNotification2 === 1 ? Constant.SEND_NOTIFICATION : Constant.NOT_SEND_NOTIFICATION,
      sendNotification1: Constant.NOT_SEND_NOTIFICATION,
      sendNotification2: Constant.NOT_SEND_NOTIFICATION,
      uploadRubric: participant.uploadRubric,
      digitalSignature: participant.digitalSignature,
      typeElectronicSignature: participant.typeElectronicSignature,
      active: participant.active
    });
    this.arrayParticipant.push(control);
  }

  get arrayParticipant() {
    return this.participantForm.get('arrayParticipant') as FormArray;
  }

  public onItemChangeParticipantType() {
    this.markAsUntouchedAllControls();
    switch (this.participant.participantType) {
      case Constant.USER:
      case Constant.INVITED_USER:
        this.participantForm.get('personName').setValidators(Validators.compose([Validators.required]));
        this.participantForm.get('personName').updateValueAndValidity();
        this.wasSelectedPersonAfterSearch = false;
        this.participant.uploadRubric = false;
        this.participant.digitalSignature = true;
        break;
      case Constant.INVITED:
        this.participantForm.get('personName').clearValidators();
        this.participantForm.get('personName').updateValueAndValidity();
        this.participant._more.personFullName = '-';
        this.participant._more.jobDescription = '-';
        this.wasSelectedPersonAfterSearch = true;
        this.participant.personId = Constant.DEFAULT_PERSON_ID;
        break;
    }
    this.lastParticipanttypeSelected = this.participant.participantType;
    this.personFullName = '';
  }

  get isInvited() {
    return Constant.INVITED === this.participant.participantType;
  }

  get isOptBatchLoadSelected() {
    return Constant.BATCH === this.workflowReceived.batch;
  }

  get isReviewOptionSelected() {
    return Constant.REVIEW_OPTION === this.participant.operationId;
  }

  public onItemChangeTsa(checked) {
    this.participant.addTsa = checked ? Constant.ADD_TSA : Constant.NOT_ADD_TSA;
  }

  public onItemChangeTsa1(checked) {
    this.participant.addTsa1 = checked ? Constant.ADD_TSA : Constant.NOT_ADD_TSA;
  }


  public onItemChangeSendAlert(checked) {
    this.participant.sendAlert = checked ? Constant.SEND_ALERT : Constant.NOT_SEND_ALERT;
  }

  public onItemChangeSendAlert1(checked) {
    this.participant.sendAlert1 = checked ? Constant.SEND_ALERT : Constant.NOT_SEND_ALERT;
  }

  public onItemChangeSendAlert2(checked) {
    this.participant.sendAlert2 = checked ? Constant.SEND_ALERT : Constant.NOT_SEND_ALERT;
  }

  public onItemChangeSendNotification(checked) {
    this.participant.sendNotification = checked ? Constant.SEND_NOTIFICATION : Constant.NOT_SEND_NOTIFICATION;
  }

  public onItemChangeSendNotification1(checked) {
    this.participant.sendNotification1 = checked ? Constant.SEND_NOTIFICATION : Constant.NOT_SEND_NOTIFICATION;
  }

  public onItemChangeSendNotification2(checked) {
    this.participant.sendNotification2 = checked ? Constant.SEND_NOTIFICATION : Constant.NOT_SEND_NOTIFICATION;
  }

  public onItemChangeUploadRubric(checked) {
    this.participant.uploadRubric = checked;
  }

  public onItemChangeDigitalSignature(checked) {
    this.participant.digitalSignature = checked;
  }

  public hasRole(roleDescription: string) {
    return this.authenticationService.hasRole(roleDescription);
  }

  private markAsUntouchedAllControls() {
    Object.values(this.participantForm.controls).forEach(control => {
      control.markAsUntouched();
    });
  }

  public getFullname(participant): string {
    return participant._more.personFullName;
  }

  public getOperationDescription(operationId): string {
    return this.operations.find(operation => operation.id === operationId).description;
  }

  public openModalNotifyPostOperation(participantId: number) {
    this.loading = true;
    this.sieemailService.getBy(participantId).subscribe((next: any) => {
      this.loading = false;
      this.viewModalNotifyPostOperation(participantId, next._embedded.sieemail);
    }, error => {
      this.loading = false;
      if (HttpStatusCode.NOT_FOUND === error.status) {
        this.viewModalNotifyPostOperation(participantId, new Sieemail());
      } else {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  private viewModalNotifyPostOperation(participantId: number, sieemail: Sieemail) {
    const modalRef = this.modalService.open(NotifyPostOperationComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.participantIdReceived = participantId;
    modalRef.componentInstance.sieemailReceived = sieemail;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        Dialog.show(InformType.Success, 'Participante');
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, 'Participante');
      }
    });
  }

  public viewSendNotificationOpt(sendNotification: number) {
    return Constant.SEND_NOTIFICATION === sendNotification;
  }

  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }

  get disableSendNotification() {
    return Constant.SIE_SIGN === this.workflowReceived.type;
  }

  get disableUploadRubric() {
    return Constant.INVITED !== this.participant.participantType;
  }

  get disableDigitalSignature() {
    // return Constant.INVITED !== this.participant.participantType;
    return false;
  }

  public drop(event: CdkDragDrop<Participant[]>) {
    moveItemInArray(this.arrayParticipant.controls, event.previousIndex, event.currentIndex);
  }

  public getBadgeTypeBy(operationType: number) {
    return Constant.SIGN_OPTION === operationType ? 'badge-success' : 'badge-dark';
  }

  public isReviewer(operationType: number) {
    return Constant.REVIEW_OPTION === operationType;
  }

  get onlySignOption(): boolean {
    return Constant.SIE_SIGN === this.workflowReceived.type;
  }

  get onlySignNotificationByLayoutOption(): boolean {
    return Constant.SIE_LAYOUT === this.workflowReceived.type;
  }

  get onlySignNotificationByLayoutOption2(): boolean {
    // return Constant.SIE_LAYOUT === this.workflowReceived.type;
    return false;
  }

  public isnotifier(operationType: number) {
    return Constant.REVIEW_OPTION === operationType;
  }

  get workflowtypeDesc(): string {
    return LocalStorage.getWorkflowtypes().find(value => this.workflowReceived.type === value.id).description;
  }

  typeSignatureChange(): void {
    if (this.participant.digitalSignature) {
      this.participant.sendAlert = Constant.SEND_ALERT;
      this.participant.sendAlert1 = Constant.NOT_SEND_ALERT;
      this.participant.sendAlert2 = Constant.NOT_SEND_ALERT;
      this.participant.addTsa1 = Constant.NOT_ADD_TSA;
      this.participant.sendNotification1 = Constant.NOT_SEND_NOTIFICATION;
      this.participant.sendNotification2 = Constant.NOT_SEND_NOTIFICATION;
      this.participant.typeElectronicSignature = 0;
    } else {
      this.participant.sendAlert = Constant.NOT_SEND_ALERT;
      this.participant.sendAlert1 = Constant.SEND_ALERT;
      this.participant.sendAlert2 = Constant.NOT_SEND_ALERT;
      this.participant.addTsa = Constant.NOT_ADD_TSA;
      this.participant.sendNotification = Constant.NOT_SEND_NOTIFICATION;
      this.participant.sendNotification2 = Constant.NOT_SEND_NOTIFICATION;
      this.participant.uploadRubric = false;
      this.participant.typeElectronicSignature = 1;
    }
  }

  description(type: number): string {
    switch (type) {
      case TypeElectronicSignature.Anything:
        return '-';
      case TypeElectronicSignature.GraphicSignature:
        return 'Firma gráfica';
      default:
        return '*';
    }
  }

  markUnmarkDigitalSignature(event: any, index: number) {
    const control = this.arrayParticipant.at(index).get('typeElectronicSignature');
    if (event.target.checked) {
      control.setValue(0);
    } else {
      control.setValue(1);
    }
  }

  typeOperationChange(): void {
    const operationId = this.participant.operationId;
    switch (operationId) {
      case Constant.SIGN_OPTION:
        this.participant.digitalSignature = true;
        this.typeSignatureChange();
        break;
      case Constant.REVIEW_OPTION:
        this.participant.digitalSignature = false;
        this.participant.sendAlert = Constant.NOT_SEND_ALERT;
        this.participant.sendAlert1 = Constant.NOT_SEND_ALERT;
        this.participant.sendAlert2 = Constant.SEND_ALERT;
        this.participant.addTsa = Constant.NOT_ADD_TSA;
        this.participant.sendNotification = Constant.NOT_SEND_NOTIFICATION;
        this.participant.sendNotification1 = Constant.NOT_SEND_NOTIFICATION;
        this.participant.uploadRubric = false;
        this.participant.typeElectronicSignature = 0;
        break;
    }
  }

  get signatureOperationSelected() {
    return Constant.SIGN_OPTION === this.participant.operationId;
  }

  get reviewOperationSelected() {
    return Constant.REVIEW_OPTION === this.participant.operationId;
  }
}

class TypeElectronicSignature {
  public static readonly Anything = 0;
  public static readonly GraphicSignature = 1;
}
