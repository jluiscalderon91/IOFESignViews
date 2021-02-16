import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {VerifierService} from '../../../user/service/verifier.service';
import {InformType} from '../../../global/util/enum/InformType';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Constant} from '../../../global/util/Constant';
import HttpStatusCode from '../../../global/util/HttpStatusCode';
import {Dialog} from '../../../global/util/Dialog';
import {Document} from '../../../user/model/Document';
import {DocumentState} from '../../../global/util/DocumentState';
import {Documentmodification} from '../../../user/model/Documentmodification';

@Component({
  selector: 'app-verifier',
  templateUrl: './verifier.component.html',
  styleUrls: ['./verifier.component.css']
})
export class VerifierComponent implements OnInit {
  private hashIdentifier;
  private hashResource;
  public operatorsInfo: any[] = [];
  public loading: boolean;
  private entityName = 'Verificación';
  private url = Constant.ROOT_API_V1.concat('/public');
  public urlStream;
  public wrongVerification = true;
  public verificationMessage = '';
  public document: Document;
  public documentmodifications: Documentmodification[] = [];
  public urlLastDocumentResource: string;

  constructor(private activatedRoute: ActivatedRoute,
              private verifierService: VerifierService,
              private modalService: NgbModal) {
    Dialog.createInstance(modalService);
    this.receiveParams();
  }

  public receiveParams() {
    this.activatedRoute.params.subscribe(params => {
      this.hashIdentifier = params.hashIdentifier;
      if (params.hashResource) {
        this.hashResource = params.hashResource;
      }
    });
  }

  ngOnInit() {
    this.loadOperatorsInfo(this.hashIdentifier, this.hashResource);
  }

  private loadOperatorsInfo(hashIdentifier: string, hashResource?: string) {
    let urlVerifierOperators = '';
    if (hashResource) {
      urlVerifierOperators = this.url.concat('/documents/')
        .concat(hashIdentifier)
        .concat('/resources/')
        .concat(hashResource)
        .concat('/verifier');

      this.urlStream = this.url.concat('/documents/')
        .concat(hashIdentifier)
        .concat('/resources/')
        .concat(hashResource)
        .concat('/stream');
    } else {
      urlVerifierOperators = this.url.concat('/documents/')
        .concat(hashIdentifier)
        .concat('/verifier');

      this.urlStream = this.url.concat('/documents/')
        .concat(hashIdentifier)
        .concat('/stream');
    }
    this.loading = true;
    this.verifierService.get(urlVerifierOperators).subscribe((next: any) => {
      this.loading = false;
      this.operatorsInfo = next._embedded.operatorsInfo;
      this.documentmodifications = next._embedded.documentmodifications;
      this.urlLastDocumentResource = next._embedded.urlLastDocumentResource;
      this.document = next._embedded.document;
      this.wrongVerification = false;
    }, error => {
      // TODO investigate and improvement next treatment for it doesn't get 404
      if (error.status) {
        this.wrongVerification = true;
        if (HttpStatusCode.NOT_FOUND === error.status) {
          this.verificationMessage = error.error.message;
        } else {
          Dialog.show(InformType.Danger, this.entityName);
        }
        this.loading = false;
      }
    });
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
