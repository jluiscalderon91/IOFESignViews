import {Component, OnInit} from '@angular/core';
import {Job} from '../../../model/Job';
import {JobService} from '../../../service/job.service';
import {AuthService} from '../../../service/auth/auth.service';
import {Constant} from '../../../../global/util/Constant';
import {Page} from '../../../../global/util/enum/Page';
import {InformType} from '../../../../global/util/enum/InformType';
import HttpStatusCode from '../../../../global/util/HttpStatusCode';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {LocalStorage} from '../../../../global/util/LocalStorage';
import {AddEditJobComponent} from '../add-edit-job/add-edit-job.component';
import {Enterprise} from '../../../model/Enterprise';
import {CloneTool} from '../../../../global/util/CloneTool';
import {ConfirmComponent} from '../../../../shared/confirm/confirm.component';
import {Response} from '../../../../global/util/enum/Response';
import {Partner} from '../../../model/Partner';
import {Dialog} from '../../../../global/util/Dialog';

@Component({
  selector: 'app-list-job',
  templateUrl: './list-job.component.html',
  styleUrls: ['./list-job.component.css']
})
export class ListJobComponent implements OnInit {

  public jobs: Job[] = [];
  public enterprises: Enterprise[] = [];
  public enterpriseIdSelected: number;
  public page: any = {};
  public links: any = {};
  private jobUrl: string;
  public enumPage = Page;
  public loading: boolean;
  public title = 'Cargos';
  private entityName = 'Cargo';
  public enterpriseSelected: Enterprise;
  public ROLE_SUPERADMIN = Constant.ROLE_SUPERADMIN;
  public ROLE_PARTNER = Constant.ROLE_PARTNER;
  public ROLE_ADMIN = Constant.ROLE_ADMIN;
  public ROLE_USER = Constant.ROLE_USER;
  public partnerSelected: Partner;
  public partners: Partner[] = [];

  constructor(public jobService: JobService,
              private modalService: NgbModal,
              public authenticationService: AuthService) {
    Dialog.createInstance(modalService);
  }

  ngOnInit() {
    this.loadDefaultData();
  }

  private loadDefaultData() {
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      this.partners = LocalStorage.getPartners();
      this.partnerSelected = this.partners[Constant.ZERO_INDEX];
      this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(this.partnerSelected.id);
      this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
      this.enterpriseIdSelected = this.enterpriseSelected.id;
    } else if (this.hasRole(this.ROLE_PARTNER)) {
      const partnerId = LocalStorage.getPartnerId();
      this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(partnerId);
      this.enterpriseSelected = this.enterprises[Constant.FIRST_INDEX];
      this.enterpriseIdSelected = this.enterpriseSelected.id;
    } else {
      this.enterpriseIdSelected = LocalStorage.getEnterpriseIdView();
    }
    this.loadJobs(Page.First);
  }

  public reloadJobs() {
    this.enterpriseIdSelected = this.enterpriseSelected.id;
    this.loadJobs(Page.First);
  }

  public loadJobs(page: Page): void {
    switch (page) {
      case Page.First:
        this.jobUrl = Constant.ROOT_API_V1
          .concat('/enterprises/')
          .concat(String(this.enterpriseIdSelected))
          .concat('/jobs');
        break;
      case Page.Previous:
        this.jobUrl = this.links.prev.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Next:
        this.jobUrl = this.links.next.href.replace('http', Constant.SCHEMA);
        break;
      case Page.Last:
        this.jobUrl = this.links.last.href.replace('http', Constant.SCHEMA);
        break;
      default:
        this.jobUrl = this.links.self.href.replace('http', Constant.SCHEMA);
        break;
    }
    this.getJobs(this.jobUrl);
  }

  private getJobs(url: string) {
    this.loading = true;
    this.jobService.get(url).subscribe((next: any) => {
      this.loading = false;
      if (next._embedded) {
        this.jobs = next._embedded.jobs;
      } else {
        this.jobs = [];
      }
      this.page = next.page;
      this.links = next._links;
    }, error => {
      this.loading = false;
      if (HttpStatusCode.UNAUTHORIZED === error.error.status) {
        Dialog.show(InformType.Danger, this.entityName, error.error.message);
      } else {
        Dialog.show(InformType.Danger, this.entityName);
      }
    });
  }

  public openAddModal() {
    const modalRef = this.modalService.open(AddEditJobComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.job = new Job();
    modalRef.componentInstance.jobs = this.jobs;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadJobs(Page.Self);
        this.reloadJobsBy(this.enterpriseIdSelected);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      } else if (InformType.Warning === result) {
        Dialog.show(InformType.Warning, this.entityName, 'El cargo ya se encuentra registrado.');
      }
    });
  }

  public openModalEdit(job: Job) {
    const job2Edit = CloneTool.do(job);
    const modalRef = this.modalService.open(AddEditJobComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.job = job2Edit;
    modalRef.componentInstance.jobs = this.jobs;
    modalRef.result.then((result) => {
      if (InformType.Success === result) {
        this.loadJobs(Page.Self);
        this.reloadJobsBy(this.enterpriseIdSelected);
        Dialog.show(InformType.Success, this.entityName);
      } else if (InformType.Danger === result) {
        Dialog.show(InformType.Danger, this.entityName);
      } else if (InformType.Warning === result) {
        Dialog.show(InformType.Warning, this.entityName, 'El cargo ya se encuentra registrado.');
      }
    });
  }

  public hasRole(name: string) {
    return this.authenticationService.hasRole(name);
  }

  public hasAuthority(code: string): boolean {
    return this.authenticationService.hasAuthority(code);
  }

  public openModalDelete(job: Job) {
    const modalRef = this.modalService.open(ConfirmComponent);
    modalRef.componentInstance.title = 'Eliminar cargo';
    modalRef.componentInstance.body = '¿Está seguro que desea eliminar el cargo?';
    modalRef.result.then((result) => {
      if (Response.Yes === result) {
        this.delete(job);
      }
    });
  }

  private delete(job: Job) {
    this.loading = true;
    this.jobService.delete(job).subscribe(next => {
      this.loading = false;
      this.loadJobs(Page.Self);
      this.reloadJobsBy(this.enterpriseIdSelected);
      Dialog.show(InformType.Success, this.entityName);
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  private reloadJobsBy(entepriseId: number) {
    this.loading = true;
    const url = Constant.ROOT_API_V1
      .concat('/enterprises/')
      .concat(String(entepriseId))
      .concat('/jobs');
    this.jobService.get(url).subscribe((next: any) => {
      this.loading = false;
      const jobs = next._embedded.jobs;
      this.updateEmbeddedValuesWithNewJobs(jobs, entepriseId);
    }, error => {
      this.loading = false;
      Dialog.show(InformType.Danger, this.entityName);
    });
  }

  private updateEmbeddedValuesWithNewJobs(jobs: Job[], enterpriseId?: number) {
    const embedded = LocalStorage.getEmbedded();
    if (this.hasRole(this.ROLE_SUPERADMIN)) {
      const oldJobs: Job[] = embedded.jobs;
      const newJobs = oldJobs.filter(job => job.enterpriseId !== enterpriseId);
      jobs.forEach(job => newJobs.push(job));
      embedded.jobs = newJobs;
    } else {
      embedded.jobs = jobs;
    }
    const embeddedRoot: any = {};
    embeddedRoot._embedded = embedded;
    localStorage.setItem('_embedded', JSON.stringify(embeddedRoot));
  }

  public reloadJobs0() {
    this.enterprises = LocalStorage.getEnterprisesAndAllOptionBy(this.partnerSelected.id);
    this.enterpriseSelected = this.enterprises[Constant.ZERO_INDEX];
    this.enterpriseIdSelected = this.enterpriseSelected.id;
    this.reloadJobs();
  }
}
