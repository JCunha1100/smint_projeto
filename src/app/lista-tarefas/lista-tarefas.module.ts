import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaTarefasPageRoutingModule } from './lista-tarefas-routing.module';

import { ListaTarefasPage } from './lista-tarefas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaTarefasPageRoutingModule
  ],
  declarations: [ListaTarefasPage]
})
export class ListaTarefasPageModule {}
