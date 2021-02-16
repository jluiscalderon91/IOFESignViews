import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AboutComponent} from './user/components/about/about.component';
import {ListEnterpriseComponent} from './user/components/enterprise/list-enterprise/list-enterprise.component';
import {ListPersonComponent} from './user/components/person/list-person/list-person.component';
import {ListDocumentComponent} from './user/components/document/list-document/list-document.component';
import {VerifierComponent} from './public/components/verifier/verifier.component';
import {ListWorkflowComponent} from './user/components/workflow/list-workflow/list-workflow.component';
import {SignComponent} from './public/components/sign/sign.component';
import {AuthGuard} from './user/service/guards/auth.guard';
import {LoginComponent} from './user/components/login/login.component';
import {ListJobComponent} from './user/components/job/list-job/list-job.component';
import {ListSieCredentialComponent} from './user/components/sie-credential/list-sie-credential/list-sie-credential.component';
import {VerifierbycodeComponent} from './public/components/verifierbycode/verifierbycode.component';
import {ListAuthorityComponent} from './user/components/authority/list-authority/list-authority.component';
import {ListRoleComponent} from './user/components/role/list-role/list-role.component';
import {ProfileComponent} from './user/components/profile/profile.component';
import {RecoverPasswordFirstStepComponent} from './public/components/recover-password-first-step/recover-password-first-step.component';
import {RecoverPasswordSecondStepComponent} from './public/components/recover-password-second-step/recover-password-second-step.component';
import {RecoverPasswordThirdStepComponent} from './public/components/recover-password-third-step/recover-password-third-step.component';
import {GlobalConfigComponent} from './user/components/global-config/global-config.component';
import {BuyBalanceComponent} from './user/components/balance/buy-balance/buy-balance.component';
import {ViewBalanceComponent} from './user/components/balance/view-balance/view-balance.component';

const APP_ROUTES: Routes = [
  {path: 'about', component: AboutComponent},
  {path: 'enterprise', component: ListEnterpriseComponent, canActivate: [AuthGuard]},
  {path: 'person', component: ListPersonComponent, canActivate: [AuthGuard]},
  {path: 'document', component: ListDocumentComponent, canActivate: [AuthGuard]},
  {path: 'document/:hashIdentifier/verifier', component: VerifierComponent},
  {path: 'document/:hashIdentifier/resources/:hashResource/verifier', component: VerifierComponent},
  {path: 'workflow', component: ListWorkflowComponent, canActivate: [AuthGuard]},
  {path: 'document/:hashIdentifier/people/:personId/sign', component: SignComponent},
  {path: 'login', component: LoginComponent},
  {path: 'job', component: ListJobComponent, canActivate: [AuthGuard]},
  {path: 'siecrendential', component: ListSieCredentialComponent, canActivate: [AuthGuard]},
  {path: 'document/verifier', component: VerifierbycodeComponent},
  {path: 'verificar', component: VerifierbycodeComponent},
  {path: 'role', component: ListRoleComponent, canActivate: [AuthGuard]},
  {path: 'authority', component: ListAuthorityComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},
  {path: 'passwordrecovery', component: RecoverPasswordFirstStepComponent},
  {path: 'verifycoderecovery', component: RecoverPasswordSecondStepComponent},
  {path: 'setuppassword', component: RecoverPasswordThirdStepComponent},
  {path: 'globalconfig', component: GlobalConfigComponent, canActivate: [AuthGuard]},
  {path: 'buy-balance', component: BuyBalanceComponent, canActivate: [AuthGuard]},
  {path: 'view-balance', component: ViewBalanceComponent, canActivate: [AuthGuard]},
  {path: '**', pathMatch: 'full', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES, {useHash: true})],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
