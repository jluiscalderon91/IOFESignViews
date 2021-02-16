import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {PDFDocumentProxy, PDFProgressData} from 'pdfjs-dist';
import {Constant} from '../../../../global/util/Constant';

@Component({
  selector: 'app-preview-template-workflow',
  templateUrl: './preview-template-workflow.component.html',
  styleUrls: ['./preview-template-workflow.component.css']
})
export class PreviewTemplateWorkflowComponent implements OnInit {

  public entityName = 'Previsualización';
  public workflowReceived: any;
  public urlStream;
  public loading = false;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit(): void {
    this.urlStream = this.workflowReceived._links.templatestream.href.replace('http', Constant.SCHEMA);
  }

  public accept() {
    this.activeModal.close(PreviewTemplateWorkflowComponent);
  }

  public onProgress(progressData: PDFProgressData) {
    this.loading = true;
  }

  public progressCompleted(pdf: PDFDocumentProxy) {
    this.loading = false;
  }

}
