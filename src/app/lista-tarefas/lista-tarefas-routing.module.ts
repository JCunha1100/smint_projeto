import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaTarefasPage } from './lista-tarefas.page';

const routes: Routes = [
  {
    path: '',
    component: ListaTarefasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaTarefasPageRoutingModule {}
