import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdicionarTarefaPage } from './adicionar-tarefa.page';

const routes: Routes = [
  {
    path: '',
    component: AdicionarTarefaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdicionarTarefaPageRoutingModule {}
