import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterLoginPage } from './register-login.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterLoginPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterLoginPageRoutingModule {}
