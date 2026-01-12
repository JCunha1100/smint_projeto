import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdicionarTarefaPageRoutingModule } from './adicionar-tarefa-routing.module';

import { AdicionarTarefaPage } from './adicionar-tarefa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdicionarTarefaPageRoutingModule
  ],
  declarations: [AdicionarTarefaPage]
})
export class AdicionarTarefaPageModule {}
