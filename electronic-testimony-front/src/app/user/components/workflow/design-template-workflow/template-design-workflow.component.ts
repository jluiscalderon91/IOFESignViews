import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Fonttype} from '../../../model/Fonttype';
import {Fontsize} from '../../../model/Fontsize';
import {Fontcolor} from '../../../model/Fontcolor';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {Pagestamp} from '../../../model/Pagestamp';
import {Stamplegend} from '../../../model/Stamplegend';
import {TemplateDesignWorkflow} from '../../../model/TemplateDesignWorkflow';
import {WorkflowService} from '../../../service/workflow.service';
import {Workflow} from '../../../model/Workflow';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {InformType} from '../../../../global/util/enum/InformType';
import {Constant} from '../../../../global/util/Constant';
import {Stampimage} from '../../../model/Stampimage';
import {Stampqrcode} from '../../../model/Stampqrcode';
import {PreviewTemplateWorkflowComponent} from '../preview-template-workflow/preview-template-workflow.component';
import {Stamptestfile} from '../../../model/Stamptestfile';
import {Contentposition} from '../../../model/Contentposition';
import {Stampdatetime} from '../../../model/Stampdatetime';
import {CloneTool} from '../../../../global/util/CloneTool';
import {PagestampState} from '../../../../global/util/PagestampState';
import {Stamplayoutfile} from '../../../model/Stamplayoutfile';
import {Dialog} from '../../../../global/util/Dialog';
import {StringUtil} from '../../../../global/util/StringUtil';
import {Participant} from '../../../model/Participant';
import {ParticipantService} from '../../../service/participant.service';
import {Stamprubric} from '../../../model/Stamprubric';

@Component({
  selector: 'app-template-design-workflow',
  templateUrl: './template-design-workflow.component.html',
  styleUrls: ['./template-design-workflow.component.css']
})
export class TemplateDesignWorkflowComponent implements OnInit {
  public loading: boolean;
  public workflowReceived: Workflow;
  public designerForm: FormGroup;
  public templateDesignWorkflow = new TemplateDesignWorkflow();
  public entityName = 'Diseño de plantilla';
  public optSelected = 0;
  private deletedStamplegends: Stamplegend[] = [];
  private deletedStampimages: Stampimage[] = [];
  private deletedStampqrcodes: Stampqrcode[] = [];
  private deletedStampdatetimes: Stampdatetime[] = [];
  private deletedStamprubrics: Stamprubric[] = [];

  public fontcolors: Fontcolor[] = [];
  public fontsizes: Fontsize[] = [];
  public fonttypes: Fonttype[] = [];
  public pagestamps: Pagestamp[] = [];
  public pagestamps4Datetime: Pagestamp[] = [];
  public contentpositions: Contentposition[] = [];
  public participants: Participant[] = [];

  constructor(private modalService: NgbModal,
              public activeModal: NgbActiveModal,
              private formBuilder: FormBuilder,
              private workflowService: WorkflowService,
              private participantService: ParticipantService) {
    Dialog.createInstance(modalService);
    this.loadInitialData();
  }

  ngOnInit(): void {
    this.createForm();
    this.loadRequiredData();
  }

  public loadInitialData() {
    this.fontcolors = LocalStorage.getFontcolors();
    this.fontsizes = LocalStorage.getFontsizes();
    this.fonttypes = LocalStorage.getFonttypes();
    this.pagestamps = LocalStorage.getPagesstamps();
    this.contentpositions = LocalStorage.getContentpositions();
    this.pagestamps4Datetime = this.preparePagestamps4Datetime(this.pagestamps);
  }

  private preparePagestamps4Datetime(pagestamps: Pagestamp[]) {
    const pagestamps4Datetime: Pagestamp[] = [];
    const data = CloneTool.doList(pagestamps);
    for (const pagestamp of data) {
      if (PagestampState.FIRST === pagestamp.id || PagestampState.LAST === pagestamp.id || PagestampState.OTHER === pagestamp.id) {
        pagestamps4Datetime.push(pagestamp);
      }
    }
    return pagestamps4Datetime;
  }

  private loadRequiredData(workflow?: any) {
    this.loadTemplateInfo(workflow);
  }

  private loadTemplateInfo(workflow?: any) {
    this.loading = true;
    this.workflowService.getTemplateDesignBy(this.workflowReceived.id).subscribe(next => {
      this.loading = false;
      this.templateDesignWorkflow = next;
      if (Constant.PREVIEW_OPTION === this.optSelected) {
        if (workflow) {
          this.openPreviewTemplateModal(workflow);
        }
      }
      if (this.isNewTemplate) {
        /*this.addRowLegend();
        this.addRowImage();
        this.addRowQrcode();*/
      } else {
        this.loadLegendRows();
        this.loadImageRows();
        this.loadQrcodeRows();
        this.loadTestfile();
        this.loadDatetimeRows();
        this.loadLayoutfile();
        this.loadRubricRows();
      }
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  private createForm() {
    this.designerForm = this.formBuilder.group(
      {
        testFileId: [''],
        testFileBase64: ['', []],
        testFilename: [''],
        testFilename2Show: [''],
        arrayLegend: this.formBuilder.array([]),
        arrayImage: this.formBuilder.array([]),
        arrayQrcode: this.formBuilder.array([]),
        arrayDatetime: this.formBuilder.array([]),
        arrayRubricParticipant: this.formBuilder.array([]),
        layoutFileId: [''],
        layoutFileBase64: ['', []],
        layoutFilename: [''],
        layoutFilename2Show: [''],
        excelLayoutFileBase64: ['', []],
        excelLayoutFilename: [''],
        excelLayoutFilename2Show: ['']
      });
  }

  public addRowLegend() {
    const group = this.formBuilder.group({
      id: ['', []],
      descriptionLegend: ['', [Validators.required]],
      positionXLegend: ['', [Validators.required]],
      positionYLegend: ['', [Validators.required]],
      rotationLegend: ['', [Validators.required]],
      fontsize: [this.fontsizes[Constant.ZERO_INDEX]],
      fonttype: [this.fonttypes[Constant.ZERO_INDEX]],
      fontcolor: [this.fontcolors[Constant.ZERO_INDEX]],
      pagestampLegend: [this.pagestamps[Constant.ZERO_INDEX]],
      stampOnLegend: ['', [Validators.required]],
      active: [Constant.ACTIVE, []]
    });
    this.arrayLegend.push(group);
  }

  private loadLegendRows() {
    this.arrayLegend.clear();
    this.deletedStamplegends = [];
    if (this.templateDesignWorkflow.stamplegends) {
      for (const stamplegend of this.templateDesignWorkflow.stamplegends) {
        const group = this.formBuilder.group({
          id: [stamplegend.id],
          descriptionLegend: [stamplegend.description],
          positionXLegend: [stamplegend.positionX],
          positionYLegend: [stamplegend.positionY],
          rotationLegend: [stamplegend.rotation],
          fontsize: [this.getFontsize(stamplegend.fontSize)],
          fonttype: [this.getFonttype(stamplegend.fontType)],
          fontcolor: [this.getFontcolor(stamplegend.fontColor)],
          pagestampLegend: [this.getPagestampOf(stamplegend.pageStamp)],
          stampOnLegend: [stamplegend.stampOn],
          active: [stamplegend.active]
        });
        this.arrayLegend.push(group);
      }
    }
  }

  get arrayLegend() {
    return this.designerForm.get('arrayLegend') as FormArray;
  }

  public deleteLegendRow(index: number) {
    const rawValue: any = this.arrayLegend.getRawValue()[index];
    if (rawValue.id) {
      const stamplegend = new Stamplegend();
      stamplegend.id = rawValue.id;
      stamplegend.active = Constant.INACTIVE;
      this.deletedStamplegends.push(stamplegend);
    }
    this.arrayLegend.removeAt(index);
  }

  public save() {
    this.optSelected = Constant.SAVE_OPTION;
    this.doSave();
  }

  public doSave() {
    this.setValuesBefore2Save();
    if (this.isNewTemplate) {
      this.register();
    } else {
      this.edit();
    }
  }

  private register() {
    this.loading = true;
    this.workflowService.saveTemplateDesign(this.templateDesignWorkflow).subscribe(next => {
      this.loading = false;
      if (Constant.PREVIEW_OPTION === this.optSelected) {
        this.loadRequiredData(next);
      } else {
        this.activeModal.close(InformType.Success);
      }
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  private edit() {
    this.loading = true;
    this.workflowService.updateTemplateDesign(this.templateDesignWorkflow).subscribe(next => {
      this.loading = false;
      if (Constant.PREVIEW_OPTION === this.optSelected) {
        this.loadRequiredData(next);
        // this.openPreviewTemplateModal(next);
      } else {
        this.activeModal.close(InformType.Success);
      }
    }, error => {
      this.loading = false;
      this.activeModal.close(InformType.Danger);
    });
  }

  private setValuesBefore2Save() {
    this.templateDesignWorkflow.workflowId = this.workflowReceived.id;
    // Prepare legends
    const stamplegends: Stamplegend[] = [];
    for (const group of this.arrayLegend.controls) {
      if (group instanceof FormGroup) {
        const stamplegend = new Stamplegend();
        stamplegend.id = group.value.id === '' ? undefined : group.value.id;
        stamplegend.description = group.value.descriptionLegend;
        stamplegend.positionX = group.value.positionXLegend;
        stamplegend.positionY = group.value.positionYLegend;
        stamplegend.rotation = group.value.rotationLegend;
        stamplegend.fontSize = group.value.fontsize.id;
        stamplegend.fontType = group.value.fonttype.id;
        stamplegend.fontColor = group.value.fontcolor.id;
        stamplegend.pageStamp = group.value.pagestampLegend.id;
        stamplegend.stampOn = group.value.stampOnLegend;
        stamplegend.active = group.value.active;
        stamplegends.push(stamplegend);
      }
    }
    this.templateDesignWorkflow.stamplegends = stamplegends;
    this.addDeletedStamlegends();
    // Prepare images
    const stampimages: Stampimage[] = [];
    for (const group of this.arrayImage.controls) {
      if (group instanceof FormGroup) {
        const stampimage = new Stampimage();
        stampimage.id = group.value.id === '' ? undefined : group.value.id;
        stampimage.name = group.value.filenameImage;
        stampimage.positionX = group.value.positionXImage;
        stampimage.positionY = group.value.positionYImage;
        stampimage.percentSize = group.value.percentSizeImage;
        stampimage.rotation = group.value.rotationImage;
        stampimage.contentPosition = group.value.contentpositionImage.id;
        stampimage.pageStamp = group.value.pagestampImage.id;
        stampimage.stampOn = group.value.stampOnImage;
        stampimage.base64Data = group.value.fileBase64Image;
        stampimage.active = group.value.active;
        stampimages.push(stampimage);
      }
    }
    this.templateDesignWorkflow.stampimages = stampimages;
    this.addDeletedStamimages();
    // Prepare qrcodes
    const stampqrcodes: Stampqrcode[] = [];
    for (const group of this.arrayQrcode.controls) {
      if (group instanceof FormGroup) {
        const stampqrcode = new Stampqrcode();
        stampqrcode.id = group.value.id === '' ? undefined : group.value.id;
        stampqrcode.positionX = group.value.positionXQrcode;
        stampqrcode.positionY = group.value.positionYQrcode;
        stampqrcode.sideSize = group.value.sideSizeQrcode;
        stampqrcode.pageStamp = group.value.pagestampQrcode.id;
        stampqrcode.stampOn = group.value.stampOnQrcode;
        stampqrcode.active = group.value.active;
        stampqrcodes.push(stampqrcode);
      }
    }
    this.templateDesignWorkflow.stampqrcodes = stampqrcodes;
    this.addDeletedStamqrcodes();
    // Prepare test file
    const stamptestfile = new Stamptestfile();
    stamptestfile.id = this.designerForm.get('testFileId').value;
    stamptestfile.name = this.designerForm.get('testFilename').value;
    stamptestfile.base64Data = this.designerForm.get('testFileBase64').value;
    this.templateDesignWorkflow.stamptestfile = stamptestfile.name !== '' ? stamptestfile : null;
    // Prepare legends
    const stampdatetimes: Stampdatetime[] = [];
    for (const group of this.arrayDatetime.controls) {
      if (group instanceof FormGroup) {
        const stampdatetime = new Stampdatetime();
        stampdatetime.id = group.value.id === '' ? undefined : group.value.id;
        stampdatetime.description = group.value.descriptionDatetime;
        stampdatetime.positionX = group.value.positionXDatetime;
        stampdatetime.positionY = group.value.positionYDatetime;
        stampdatetime.widthContainer = group.value.widthContainerDatetime;
        stampdatetime.heightContainer = group.value.heightContainerDatetime;
        stampdatetime.pageStamp = group.value.pagestampDatetime.id;
        stampdatetime.stampOn = group.value.stampOnDatetime;
        stampdatetime.active = group.value.active;
        stampdatetimes.push(stampdatetime);
      }
    }
    this.templateDesignWorkflow.stampdatetimes = stampdatetimes;
    // Prepare stmamprubrics
    const stamprubrics: Stamprubric[] = [];
    for (const group of this.arrayRubricParticipant.controls) {
      if (group instanceof FormGroup) {
        const stamprubric = new Stamprubric();
        stamprubric.id = group.value.id === '' ? undefined : group.value.id;
        stamprubric.participantId = group.value.participantId;
        stamprubric.positionX = group.value.positionXRubric;
        stamprubric.positionY = group.value.positionYRubric;
        stamprubric.positionXf = group.value.positionXfRubric;
        stamprubric.positionYf = group.value.positionYfRubric;
        stamprubric.percentSize = group.value.percentSizeRubric;
        stamprubric.rotation = group.value.rotationRubric;
        stamprubric.contentPosition = group.value.contentpositionRubric.id;
        stamprubric.pageStamp = group.value.pagestampRubric.id;
        stamprubric.stampOn = group.value.stampOnRubric;
        stamprubric.active = group.value.active;
        stamprubrics.push(stamprubric);
      }
    }
    this.templateDesignWorkflow.stamprubrics = stamprubrics;
    this.addDeletedStamprubrics();
    // Prepare test file
    const stamplayoutfile = new Stamplayoutfile();
    stamplayoutfile.id = this.designerForm.get('layoutFileId').value;
    stamplayoutfile.name = this.designerForm.get('layoutFilename').value;
    stamplayoutfile.base64Data = this.designerForm.get('layoutFileBase64').value;
    stamplayoutfile.excelName = this.designerForm.get('excelLayoutFilename').value;
    stamplayoutfile.excelBase64Data = this.designerForm.get('excelLayoutFileBase64').value;
    this.templateDesignWorkflow.stamplayoutfile = stamplayoutfile.name !== '' ? stamplayoutfile : null;
    this.addDeletedStampdatetimes();
  }

  public cancel() {
    this.activeModal.close(TemplateDesignWorkflowComponent);
  }

  get isNewTemplate(): boolean {
    if (this.templateDesignWorkflow.stamplegends) {
      if (this.templateDesignWorkflow.stamplegends.length === 0 &&
        this.templateDesignWorkflow.stampimages.length === 0 &&
        this.templateDesignWorkflow.stampqrcodes.length === 0 &&
        this.templateDesignWorkflow.stampdatetimes.length === 0 &&
        this.templateDesignWorkflow.stamptestfile === undefined &&
        this.templateDesignWorkflow.stamplayoutfile === undefined &&
        this.templateDesignWorkflow.stamprubrics.length === 0) {
        return true;
      } else {
        return !this.existSomeRegisteredStamplegened
          && !this.existSomeRegisteredStampimage
          && !this.existSomeRegisteredStampqrcode
          && !this.existSomeRegisteredFiletest
          && !this.existSomeRegisteredStampdatetime
          && !this.existSomeRegisteredFilelayout
          && !this.existSomeRegisteredStamprubric;
      }
    } else {
      return true;
    }
  }

  get existSomeRegisteredStamplegened(): boolean {
    return !(this.templateDesignWorkflow.stamplegends.find(stamplegend => stamplegend.id !== undefined) === undefined);
  }

  get existSomeRegisteredStampimage(): boolean {
    return !(this.templateDesignWorkflow.stampimages.find(stampimage => stampimage.id !== undefined) === undefined);
  }

  get existSomeRegisteredStampqrcode(): boolean {
    return !(this.templateDesignWorkflow.stampqrcodes.find(stampqrcode => stampqrcode.id !== undefined) === undefined);
  }

  get existSomeRegisteredStampdatetime(): boolean {
    return !(this.templateDesignWorkflow.stampdatetimes.find(stampdatetime => stampdatetime.id !== undefined) === undefined);
  }

  get existSomeRegisteredFiletest(): boolean {
    if (this.templateDesignWorkflow.stamptestfile) {
      return !(this.templateDesignWorkflow.stamptestfile.name === '');
    }
    return false;
  }

  get existSomeRegisteredFilelayout(): boolean {
    if (this.templateDesignWorkflow.stamplayoutfile) {
      return !(this.templateDesignWorkflow.stamplayoutfile.name === '');
    }
    return false;
  }

  get existSomeRegisteredStamprubric(): boolean {
    return !(this.templateDesignWorkflow.stamprubrics.find(stamprubric => stamprubric.id !== undefined) === undefined);
  }

  private getFontsize(fontsizeId: number): Fontsize {
    return this.fontsizes.find(fontsize => fontsize.id === fontsizeId);
  }

  private getFontcolor(fontcolorId: number): Fontcolor {
    return this.fontcolors.find(fontcolor => fontcolor.id === fontcolorId);
  }

  private getFonttype(fonttypeId: number): Fonttype {
    return this.fonttypes.find(fonttype => fonttype.id === fonttypeId);
  }

  private getPagestampOf(pagestampId: number): Fonttype {
    return this.pagestamps.find(pagestamp => pagestamp.id === pagestampId);
  }

  private getPagestamp4DatetimeOf(pagestampId: number): Fonttype {
    return this.pagestamps4Datetime.find(pagestamp => pagestamp.id === pagestampId);
  }

  private getContentpositionOf(contentpositionId: number): Fonttype {
    return this.contentpositions.find(contentposition => contentposition.id === contentpositionId);
  }

  private addDeletedStamlegends() {
    this.deletedStamplegends.forEach(stamplegend => this.templateDesignWorkflow.stamplegends.push(stamplegend));
  }

  get arrayImage() {
    return this.designerForm.get('arrayImage') as FormArray;
  }

  public addRowImage() {
    const group = this.formBuilder.group({
      id: ['', []],
      fileBase64Image: ['', [Validators.required]],
      filenameImage: [''],
      filename2ShowImage: [''],
      positionXImage: ['', [Validators.required]],
      positionYImage: ['', [Validators.required]],
      percentSizeImage: ['', [Validators.required]],
      rotationImage: ['', [Validators.required]],
      contentpositionImage: [this.contentpositions[Constant.ZERO_INDEX]],
      pagestampImage: [this.pagestamps[Constant.ZERO_INDEX]],
      stampOnImage: ['', [Validators.required]],
      active: [Constant.ACTIVE, []]
    });
    this.arrayImage.push(group);
  }

  public changeStatus(event: any, index: number) {
    const fileImage = event[Constant.ZERO_INDEX];
    const group = this.arrayImage.at(index);
    group.patchValue({
      fileBase64Image: fileImage.base64,
      filenameImage: fileImage.name,
      filename2ShowImage: StringUtil.cut(fileImage.name, 42, 'Seleccione...'),
    });
    group.get('fileBase64Image').updateValueAndValidity();
  }

  public changeStatus2(event: any) {
    const testFile = event[Constant.ZERO_INDEX];
    this.designerForm.patchValue({
      testFileBase64: testFile.base64,
      testFilename: testFile.name,
      testFilename2Show: StringUtil.cut(testFile.name, 42, 'Seleccione...'),
    });
    this.designerForm.get('testFileBase64').updateValueAndValidity();
  }

  public changeStatus3(event: any) {
    const layoutFile = event[Constant.ZERO_INDEX];
    this.designerForm.patchValue({
      layoutFileBase64: layoutFile.base64,
      layoutFilename: layoutFile.name,
      layoutFilename2Show: StringUtil.cut(layoutFile.name, 42, 'Seleccione...'),
    });
    this.designerForm.get('layoutFileBase64').updateValueAndValidity();
  }

  public changeStatus4(event: any) {
    const excelLayoutFile = event[Constant.ZERO_INDEX];
    this.designerForm.patchValue({
      excelLayoutFileBase64: excelLayoutFile.base64,
      excelLayoutFilename: excelLayoutFile.name,
      excelLayoutFilename2Show: StringUtil.cut(excelLayoutFile.name, 42, 'Seleccione...'),
    });
    this.designerForm.get('excelLayoutFileBase64').updateValueAndValidity();
  }

  private loadImageRows() {
    this.arrayImage.clear();
    this.deletedStampimages = [];
    if (this.templateDesignWorkflow.stampimages) {
      for (const stampimage of this.templateDesignWorkflow.stampimages) {
        const group = this.formBuilder.group({
          id: [stampimage.id],
          filename2ShowImage: StringUtil.cut(stampimage.name, 42, 'Seleccione...'),
          positionXImage: [stampimage.positionX],
          positionYImage: [stampimage.positionY],
          percentSizeImage: [stampimage.percentSize],
          rotationImage: [stampimage.rotation],
          contentpositionImage: [this.getContentpositionOf(stampimage.contentPosition)],
          pagestampImage: [this.getPagestampOf(stampimage.pageStamp)],
          stampOnImage: [stampimage.stampOn],
          active: [stampimage.active]
        });
        this.arrayImage.push(group);
      }
    }
  }

  private loadRubricRows() {
    this.arrayRubricParticipant.clear();
    this.deletedStamprubrics = [];
    if (this.templateDesignWorkflow.stamprubrics) {
      for (const stamprubric of this.templateDesignWorkflow.stamprubrics) {
        const group = this.formBuilder.group({
          id: [stamprubric.id],
          participantId: [stamprubric.participantId],
          positionXRubric: [stamprubric.positionX],
          positionYRubric: [stamprubric.positionY],
          positionXfRubric: [stamprubric.positionXf],
          positionYfRubric: [stamprubric.positionYf],
          percentSizeRubric: [stamprubric.percentSize],
          rotationRubric: [stamprubric.rotation],
          contentpositionRubric: [this.getContentpositionOf(stamprubric.contentPosition)],
          pagestampRubric: [this.getPagestampOf(stamprubric.pageStamp)],
          stampOnRubric: [stamprubric.stampOn],
          active: [stamprubric.active]
        });
        this.arrayRubricParticipant.push(group);
      }
    }
  }

  public deleteImageRow(index: number) {
    const rawValue: any = this.arrayImage.getRawValue()[index];
    if (rawValue.id) {
      const stampimage = new Stampimage();
      stampimage.id = rawValue.id;
      stampimage.active = Constant.INACTIVE;
      this.deletedStampimages.push(stampimage);
    }
    this.arrayImage.removeAt(index);
  }

  private addDeletedStamimages() {
    this.deletedStampimages.forEach(stampimage => this.templateDesignWorkflow.stampimages.push(stampimage));
  }

  // For QR codes
  get arrayQrcode() {
    return this.designerForm.get('arrayQrcode') as FormArray;
  }

  public addRowQrcode() {
    const group = this.formBuilder.group({
      id: ['', []],
      positionXQrcode: ['', [Validators.required]],
      positionYQrcode: ['', [Validators.required]],
      sideSizeQrcode: ['', [Validators.required]],
      pagestampQrcode: [this.pagestamps[Constant.ZERO_INDEX]],
      stampOnQrcode: ['', [Validators.required]],
      active: [Constant.ACTIVE, []]
    });
    this.arrayQrcode.push(group);
  }

  public deleteQrcodeRow(index: number) {
    const rawValue: any = this.arrayQrcode.getRawValue()[index];
    if (rawValue.id) {
      const stampqrcode = new Stampqrcode();
      stampqrcode.id = rawValue.id;
      stampqrcode.active = Constant.INACTIVE;
      this.deletedStampqrcodes.push(stampqrcode);
    }
    this.arrayQrcode.removeAt(index);
  }

  private addDeletedStamqrcodes() {
    this.deletedStampqrcodes.forEach(stampqrcode => this.templateDesignWorkflow.stampqrcodes.push(stampqrcode));
  }

  private loadQrcodeRows() {
    this.arrayQrcode.clear();
    this.deletedStampqrcodes = [];
    if (this.templateDesignWorkflow.stampqrcodes) {
      for (const stampqrcode of this.templateDesignWorkflow.stampqrcodes) {
        const group = this.formBuilder.group({
          id: [stampqrcode.id],
          positionXQrcode: [stampqrcode.positionX],
          positionYQrcode: [stampqrcode.positionY],
          sideSizeQrcode: [stampqrcode.sideSize],
          pagestampQrcode: [this.getPagestampOf(stampqrcode.pageStamp)],
          stampOnQrcode: [stampqrcode.stampOn],
          active: [stampqrcode.active]
        });
        this.arrayQrcode.push(group);
      }
    }
  }

  /**
   * Procedimiento del método previsualizar: es necesario en primer lugar registrar
   * todas las modificaciones que pudieron generarse, las obtiene, posteriormente limpia
   * las listas antiguas y reemplaza los ítems con los nuevos. Finalmente con la respuesta
   * anterior abre de diálogo y previsualiza el documento.
   */
  public preview() {
    this.optSelected = Constant.PREVIEW_OPTION;
    this.doSave();
  }

  private openPreviewTemplateModal(workflow: any) {
    const modalRef = this.modalService.open(PreviewTemplateWorkflowComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.workflowReceived = workflow;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Warning === result) {
        Dialog.show(InformType.Warning, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  private loadTestfile() {
    if (this.templateDesignWorkflow.stamptestfile) {
      const stamptestfile = this.templateDesignWorkflow.stamptestfile;
      this.designerForm.patchValue({
        testFileId: stamptestfile.id,
        testFilename2Show: StringUtil.cut(stamptestfile.name, 42, 'Seleccione...')
      });
    }
  }

  private loadLayoutfile() {
    if (this.templateDesignWorkflow.stamplayoutfile) {
      const stamplayoutfile = this.templateDesignWorkflow.stamplayoutfile;
      this.designerForm.patchValue({
        layoutFileId: stamplayoutfile.id,
        layoutFilename2Show: StringUtil.cut(stamplayoutfile.name, 42, 'Seleccione...'),
        excelLayoutFilename2Show: StringUtil.cut(stamplayoutfile.excelName, 42, 'Seleccione...')
      });
    }
  }

  get arrayDatetime() {
    return this.designerForm.get('arrayDatetime') as FormArray;
  }

  public addRowDatetime() {
    const group = this.formBuilder.group({
      id: ['', []],
      descriptionDatetime: ['<DATE>', [Validators.required]],
      positionXDatetime: ['', [Validators.required]],
      positionYDatetime: ['', [Validators.required]],
      widthContainerDatetime: ['', [Validators.required]],
      heightContainerDatetime: ['', [Validators.required]],
      pagestampDatetime: [this.pagestamps4Datetime[Constant.ZERO_INDEX]],
      stampOnDatetime: ['', [Validators.required]],
      active: [Constant.ACTIVE, []]
    });
    this.arrayDatetime.push(group);
  }

  public deleteDatetimeRow(index: number) {
    const rawValue: any = this.arrayDatetime.getRawValue()[index];
    if (rawValue.id) {
      const stampdatetime = new Stampdatetime();
      stampdatetime.id = rawValue.id;
      stampdatetime.active = Constant.INACTIVE;
      this.deletedStampdatetimes.push(stampdatetime);
    }
    this.arrayDatetime.removeAt(index);
  }

  private addDeletedStampdatetimes() {
    this.deletedStampdatetimes.forEach(deletedStampdatetime => this.templateDesignWorkflow.stampdatetimes.push(deletedStampdatetime));
  }

  private loadDatetimeRows() {
    this.arrayDatetime.clear();
    this.deletedStampdatetimes = [];
    if (this.templateDesignWorkflow.stampdatetimes) {
      for (const stampdatetime of this.templateDesignWorkflow.stampdatetimes) {
        const group = this.formBuilder.group({
          id: [stampdatetime.id],
          descriptionDatetime: [stampdatetime.description],
          positionXDatetime: [stampdatetime.positionX],
          positionYDatetime: [stampdatetime.positionY],
          widthContainerDatetime: [stampdatetime.widthContainer],
          heightContainerDatetime: [stampdatetime.heightContainer],
          pagestampDatetime: [this.getPagestamp4DatetimeOf(stampdatetime.pageStamp)],
          stampOnDatetime: [stampdatetime.stampOn],
          active: [stampdatetime.active]
        });
        this.arrayDatetime.push(group);
      }
    }
  }

  get selectedLayoutOption() {
    return this.workflowReceived.type === Constant.SIE_LAYOUT;
  }

  get arrayRubricParticipant() {
    return this.designerForm.get('arrayRubricParticipant') as FormArray;
  }

  public addRowRubricParticipant() {
    const group = this.formBuilder.group({
      id: ['', []],
      participantId: [this.participants[Constant.ZERO_INDEX].id],
      positionXRubric: ['', [Validators.required]],
      positionYRubric: ['', [Validators.required]],
      positionXfRubric: ['', [Validators.required]],
      positionYfRubric: ['', [Validators.required]],
      percentSizeRubric: ['', [Validators.required]],
      rotationRubric: ['', [Validators.required]],
      contentpositionRubric: [this.contentpositions[Constant.ZERO_INDEX]],
      pagestampRubric: [this.pagestamps[Constant.ZERO_INDEX]],
      stampOnRubric: ['', [Validators.required]],
      active: [Constant.ACTIVE, []]
    });
    this.arrayRubricParticipant.push(group);
  }

  get participantsIsFull() {
    return this.participants.length !== 0 && this.participants.length === this.arrayRubricParticipant.length;
  }

  public deleteParticipantRow(index: number) {
    const rawValue: any = this.arrayRubricParticipant.getRawValue()[index];
    if (rawValue.id) {
      const stamprubric = new Stamprubric();
      stamprubric.id = rawValue.id;
      stamprubric.active = Constant.INACTIVE;
      this.deletedStamprubrics.push(stamprubric);
    }
    this.arrayRubricParticipant.removeAt(index);
  }

  private addDeletedStamprubrics() {
    this.deletedStamprubrics.forEach(stamprubric => this.templateDesignWorkflow.stamprubrics.push(stamprubric));
  }
}
