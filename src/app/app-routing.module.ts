import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QrCodeComponent } from './components/qr-code/qr-code.component';
import { ConsentFormComponent } from './components/consent-form/consent-form.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'qr',
    pathMatch: 'full',
  },
  {
    path: 'qr',
    component: QrCodeComponent,
  },
  {
    path: 'consent/:consultant',
    component: ConsentFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
