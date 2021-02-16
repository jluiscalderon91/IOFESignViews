import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
// Other modules
import {PdfViewerModule} from 'ng2-pdf-viewer';

import {AppComponent} from './app.component';
// Routes
import {AppRoutingModule} from './app.routes';
// Components
import {HeaderComponent} from './shared/header/header.component';
import {FooterComponent} from './shared/footer/footer.component';
import {AboutComponent} from './user/components/about/about.component';
import {AddEditEnterpriseComponent} from './user/components/enterprise/add-edit-enterprise/add-edit-enterprise.component';
import {ListEnterpriseComponent} from './user/components/enterprise/list-enterprise/list-enterprise.component';
import {ListPersonComponent} from './user/components/person/list-person/list-person.component';
import {AddEditPersonComponent} from './user/components/person/add-edit-person/add-edit-person.component';
import {DeletePersonComponent} from './user/components/person/delete-person/delete-person.component';
import {LoadingComponent} from './shared/loading/loading.component';
import {InformComponent} from './shared/inform/inform.component';
import {ListDocumentComponent} from './user/components/document/list-document/list-document.component';
import {AddDocumentBatchComponent} from './user/components/document/add-document-batch/add-document-batch.component';
import {DeleteEnterpriseComponent} from './user/components/enterprise/delete-enterprise/delete-enterprise.component';
import {VerifierComponent} from './public/components/verifier/verifier.component';
import {ReviewDocumentComponent} from './user/components/document/review-document/review-document.component';
import {ListWorkflowComponent} from './user/components/workflow/list-workflow/list-workflow.component';
import {AddEditWorkflowComponent} from './user/components/workflow/add-edit-workflow/add-edit-workflow.component';
import {AddgroupParticipantComponent} from './user/components/participant/addgroup-participant/addgroup-participant.component';
import {AddDocumentOneComponent} from './user/components/document/add-document-one/add-document-one.component';
import {SignComponent} from './public/components/sign/sign.component';
// Pipes
import {EnterpriseNamePipe} from './user/pipes/enterprise-name.pipe';
import {NamePipe} from './user/pipes/name.pipe';
import {DateformatPipe} from './user/pipes/dateformat.pipe';
import {DescriptionParticipantTypePipe} from './user/pipes/participant-type.pipe';
import {AuthInterceptorService} from './user/service/auth-interceptor.service';
import {LoginComponent} from './user/components/login/login.component';
import {DescriptionPipe} from './user/pipes/description.pipe';
import {DescriptionDocumentTypePipe} from './user/pipes/description-document-type.pipe';
import {JobDescriptionPipe} from './user/pipes/job-description.pipe';
import {CopyclipboardComponent} from './shared/copyclipboard/copyclipboard.component';
import {AssignWorkflowPersonComponent} from './user/components/person/assign-workflow-person/assign-workflow-person.component';
import {ViewParticipantComponent} from './user/components/document/view-participant/view-participant.component';
import {ListJobComponent} from './user/components/job/list-job/list-job.component';
import {AddEditJobComponent} from './user/components/job/add-edit-job/add-edit-job.component';
import {NotifyPostOperationComponent} from './user/components/participant/notify-post-operation/notify-post-operation.component';
import {ListSieCredentialComponent} from './user/components/sie-credential/list-sie-credential/list-sie-credential.component';
import {AddSieCredentialComponent} from './user/components/sie-credential/add-sie-credential/add-sie-credential.component';
import {QuillModule} from 'ngx-quill';
import {TemplateDesignWorkflowComponent} from './user/components/workflow/design-template-workflow/template-design-workflow.component';
import {AlifeFileToBase64Module} from 'alife-file-to-base64';
import {PreviewTemplateWorkflowComponent} from './user/components/workflow/preview-template-workflow/preview-template-workflow.component';
import {VerifierbycodeComponent} from './public/components/verifierbycode/verifierbycode.component';
import {ConfirmComponent} from './shared/confirm/confirm.component';
import {ListAuthorityComponent} from './user/components/authority/list-authority/list-authority.component';
import {AddEditAuthorityComponent} from './user/components/authority/add-edit-authority/add-edit-authority.component';
import {ListRoleComponent} from './user/components/role/list-role/list-role.component';
import {AddEditRoleComponent} from './user/components/role/add-edit-role/add-edit-role.component';
import {AssignAuthorityRoleComponent} from './user/components/role/assign-authority-role/assign-authority-role.component';
import {NgIdleKeepaliveModule} from '@ng-idle/keepalive';
import {IdleconfirmComponent} from './shared/idleconfirm/idleconfirm.component';
import {AddDocumentOneDynamicComponent} from './user/components/document/add-document-one-dynamic/add-document-one-dynamic.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ReasignParticipantComponent} from './user/components/document/reasign-participant/reasign-participant.component';
import {CancelDocumentComponent} from './user/components/document/cancel-document/cancel-document.component';
import {ViewObservationCancelComponent} from './user/components/document/view-observation-cancel/view-observation-cancel.component';
import {ViewDocumentComponent} from './user/components/document/view-document/view-document.component';
import {ProfileComponent} from './user/components/profile/profile.component';
import {RecoverPasswordFirstStepComponent} from './public/components/recover-password-first-step/recover-password-first-step.component';
import {RecoverPasswordSecondStepComponent} from './public/components/recover-password-second-step/recover-password-second-step.component';
import {RecoverPasswordThirdStepComponent} from './public/components/recover-password-third-step/recover-password-third-step.component';
import {RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaModule, RecaptchaSettings} from 'ng-recaptcha';
import {Constant} from './global/util/Constant';
import {AlertAddDocumentComponent} from './shared/alert/alert-add-document/alert-add-document.component';
import {GlobalConfigComponent} from './user/components/global-config/global-config.component';
import {AssignBalanceEnterpriseComponent} from './user/components/enterprise/assign-balance-enterprise/assign-balance-enterprise.component';
import {ViewHistoricalBalanceComponent} from './user/components/enterprise/view-historical-balance/view-historical-balance.component';
import {DatetimeformatPipe} from './user/pipes/datetimeformat.pipe';
import {BuyBalanceComponent} from './user/components/balance/buy-balance/buy-balance.component';
import {CardBalanceComponent} from './shared/card-balance/card-balance.component';
import {ViewBalanceComponent} from './user/components/balance/view-balance/view-balance.component';
import {SendToEmailComponent} from './user/components/document/send-to-email/send-to-email.component';
import { SignDocumentInternalComponent } from './user/components/document/sign-document-internal/sign-document-internal.component';
import { ModifyDocumentComponent } from './user/components/document/modify-document/modify-document.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    AboutComponent,
    AddEditEnterpriseComponent,
    ListEnterpriseComponent,
    LoadingComponent,
    InformComponent,
    AddEditPersonComponent,
    ListPersonComponent,
    DateformatPipe,
    DeletePersonComponent,
    ListDocumentComponent,
    AddDocumentBatchComponent,
    DeleteEnterpriseComponent,
    DescriptionParticipantTypePipe,
    VerifierComponent,
    ReviewDocumentComponent,
    AddDocumentOneComponent,
    ListWorkflowComponent,
    AddEditWorkflowComponent,
    AddgroupParticipantComponent,
    DescriptionParticipantTypePipe,
    EnterpriseNamePipe,
    SignComponent,
    SignComponent,
    NamePipe,
    LoginComponent,
    DescriptionPipe,
    DescriptionDocumentTypePipe,
    JobDescriptionPipe,
    CopyclipboardComponent,
    AssignWorkflowPersonComponent,
    ViewParticipantComponent,
    ListJobComponent,
    AddEditJobComponent,
    NotifyPostOperationComponent,
    ListSieCredentialComponent,
    AddSieCredentialComponent,
    TemplateDesignWorkflowComponent,
    PreviewTemplateWorkflowComponent,
    VerifierbycodeComponent,
    ConfirmComponent,
    ListAuthorityComponent,
    AddEditAuthorityComponent,
    ListRoleComponent,
    AddEditRoleComponent,
    AssignAuthorityRoleComponent,
    IdleconfirmComponent,
    AddDocumentOneDynamicComponent,
    ReasignParticipantComponent,
    CancelDocumentComponent,
    ViewObservationCancelComponent,
    ViewDocumentComponent,
    ProfileComponent,
    RecoverPasswordFirstStepComponent,
    RecoverPasswordSecondStepComponent,
    RecoverPasswordThirdStepComponent,
    AlertAddDocumentComponent,
    GlobalConfigComponent,
    AssignBalanceEnterpriseComponent,
    ViewHistoricalBalanceComponent,
    DatetimeformatPipe,
    BuyBalanceComponent,
    CardBalanceComponent,
    ViewBalanceComponent,
    SendToEmailComponent,
    SignDocumentInternalComponent,
    ModifyDocumentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
    QuillModule.forRoot(),
    AlifeFileToBase64Module,
    NgIdleKeepaliveModule.forRoot(),
    DragDropModule,
    RecaptchaModule,
    RecaptchaFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    }, {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey:
        // @ts-ignore
          Constant.MODE === Constant.LOCAL_MODE ? '6LfQT94ZAAAAAJY9Qa6YFKGST-TqGro3jQjS4Sb2' :
            // @ts-ignore
            Constant.MODE === Constant.DEV_MODE ? '6LdRs94ZAAAAANIVlpJ6LD5ox5NvMBx-s2P0ZUD8' :
              // @ts-ignore
              Constant.MODE === Constant.QA_MODE ? '6Ld8s94ZAAAAABENKJeDLr3TXxzAycWQ7qDV714c' :
                '6LeEs94ZAAAAAFNT6nJ5JMlzeRmH5TYw3-VAg-oA'
      } as RecaptchaSettings
    }
  ],
  entryComponents: [
    AddgroupParticipantComponent,
    AddEditEnterpriseComponent,
    AddDocumentBatchComponent,
    AddEditWorkflowComponent,
    AddDocumentOneComponent,
    AddEditPersonComponent,
    DeletePersonComponent,
    DeleteEnterpriseComponent,
    InformComponent,
    ReviewDocumentComponent,
    AssignWorkflowPersonComponent,
    ViewParticipantComponent,
    AddEditJobComponent,
    NotifyPostOperationComponent,
    AddSieCredentialComponent,
    TemplateDesignWorkflowComponent,
    PreviewTemplateWorkflowComponent,
    ConfirmComponent,
    AddEditAuthorityComponent,
    AddEditRoleComponent,
    AssignAuthorityRoleComponent,
    IdleconfirmComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
