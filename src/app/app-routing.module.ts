import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AuthGuard } from './_helpers';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const profileModule = () => import('./profile/profile.module').then(x => x.ProfileModule);
const videoCallModule = () => import('./video-call/video-call.module').then(x => x.VideoCallModule);
const findParticipantModule =
    () => import('./find-participant/find-participant.module').then(x => x.FindParticipantModule);

const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'account', loadChildren: accountModule },
    { path: 'profile', loadChildren: profileModule, canActivate: [AuthGuard] },
    { path: 'video', loadChildren: videoCallModule, canActivate: [AuthGuard] },
    { path: 'call', loadChildren: findParticipantModule, canActivate: [AuthGuard] },


    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})], //[RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
