import {Constant} from './Constant';
import {Role} from '../../user/model/Role';
import {Authority} from '../../user/model/Authority';
import {Enterprise} from '../../user/model/Enterprise';
import {Partner} from '../../user/model/Partner';
import {Workflowtype} from '../../user/model/Workflowtype';
import {Job} from '../../user/model/Job';
import {Workflow} from '../../user/model/Workflow';
import {Shoppingcard} from '../../user/model/Shoppingcard';
import {Service} from '../../user/model/Service';

export class LocalStorage {

  public static getEnterprisesAndAllOptionBy(partnerId: number): Enterprise[] {

    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.enterprises.filter(value => partnerId === value.partnerId);
    }
  }

  public static getEnterprises(): Enterprise[] {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.enterprises.splice(Constant.FIRST_INDEX);
    }
  }

  public static getOperations(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.operations;
    }
  }

  public static getPartners(): Partner[] {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.partners;
    }
  }

  public static getWorkflows(enterpriseId: number): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      const workflows: Workflow[] = JSON.parse(_embedded)._embedded.workflows;
      return workflows.filter(workflow => (workflow.enterpriseId === enterpriseId || workflow.enterpriseId === Constant.DEFAULT_ENTERPRISE_ID_VIEW) && workflow.ready2Use === Constant.READY_TO_USE);
    }
  }

  public static getProfile(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile;
    }
  }

  public static getEnterpriseId(): number {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile.enterpriseId;
    }
  }

  public static getEnterpriseIdView() {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile.enterpriseIdView;
    }
  }

  public static getPersonId() {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile.personId;
    }
  }

  static getIdentificationDocuments() {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.identificationDocuments;
    }
  }

  public static getRolesAndAllOption(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.roles;
    }
  }

  public static getRoles(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.roles.splice(Constant.FIRST_INDEX);
    }
  }

  public static getUserRoles(): Role[] {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile.roles;
    }
  }

  public static getUserAuthorities(): Authority[] {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile.authorities;
    }
  }

  public static getParticipantTypes(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.participanttypes;
    }
  }

  public static getPersonTypes(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.persontypes;
    }
  }

  public static getJobs(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.jobs;
    }
  }

  public static getJobsBy(enterpriseId: number): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      const jobs: Job[] = JSON.parse(_embedded)._embedded.jobs;
      return jobs.filter(job => job.enterpriseId === enterpriseId && Constant.ACTIVE === job.active);
    }
  }

  public static getEnterpriseDocumentNumber(): string {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile.enterpriseDocumentNumber;
    }
  }

  public static getEnterpriseDocumentNumberView() {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile.enterpriseDocumentNumberView;
    }
  }

  public static getEnterpriseName() {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile.enterpriseName;
    }
  }

  public static getEnterpriseNameView() {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile.enterpriseNameView;
    }
  }

  public static getParticipantType() {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile.participantType;
    }
  }

  public static getWorkflowsByPerson(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      const workflows: Workflow[] = JSON.parse(_embedded)._embedded.profile.workflows;
      return workflows.filter(workflow => workflow.ready2Use === Constant.READY_TO_USE);
    }
  }

  public static getTodayString(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.today;
    }
  }

  public static getFontcolors(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.fontcolors;
    }
  }

  public static getFontsizes(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.fontsizes;
    }
  }

  public static getFonttypes(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.fonttypes;
    }
  }

  public static getPagesstamps(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.pagestamps;
    }
  }

  public static getContentpositions(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.contentpositions;
    }
  }

  public static getAuthorities(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.authorities;
    } else {
      return [];
    }
  }

  public static getModules(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.modules;
    }
  }

  public static hasDeliverOption(): boolean {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      const setting = JSON.parse(_embedded)._embedded.setting;
      if (setting) {
        return Constant.HAS_DELIVER_OPTION === setting.hasDeliverOption;
      }
      return false;
    } else {
      return false;
    }
  }

  public static getStates(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.states;
    }
  }

  public static getWorkflowtypes(): Workflowtype[] {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.workflowtypes;
    }
  }

  public static getEmbedded(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded;
    }
  }

  public static getPartnerId() {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.profile.partnerId;
    }
  }

  public static getUUID() {
    const uuid = localStorage.getItem('uuid');
    if (uuid) {
      return uuid;
    }
  }

  public static getHash1() {
    const uuid = localStorage.getItem('hash1');
    if (uuid) {
      return uuid;
    }
  }

  public static getHash2() {
    const uuid = localStorage.getItem('hash2');
    if (uuid) {
      return uuid;
    }
  }

  public static getOtherParams(): any {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.others;
    }
  }

  public static hasConfigBalance(): boolean {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return Constant.HAS_CONFIG_BALANCE === JSON.parse(_embedded)._embedded.hasConfigBalance;
    }
  }

  public static actualBalance(): number {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.balance;
    }
  }

  public static setBalanceInfo(balanceInfo: any) {
    // tslint:disable-next-line:variable-name
    const _embedded: any = localStorage.getItem('_embedded');
    if (_embedded) {
      const parse = JSON.parse(_embedded);
      parse._embedded.balance = balanceInfo.balance;
      parse._embedded.hasConfigBalance = balanceInfo.hasConfigBalance;
      localStorage.setItem('_embedded', JSON.stringify(parse));
    }
  }

  public static getShoppingcards(): Shoppingcard[] {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.shoppingcards;
    }
  }

  public static getServices(): Service[] {
    // tslint:disable-next-line:variable-name
    const _embedded = localStorage.getItem('_embedded');
    if (_embedded) {
      return JSON.parse(_embedded)._embedded.services;
    }
  }
}
