import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterLoginPageRoutingModule } from './register-login-routing.module';

import { RegisterLoginPage } from './register-login.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterLoginPageRoutingModule
  ],
  declarations: [RegisterLoginPage]
})
export class RegisterLoginPageModule {}
