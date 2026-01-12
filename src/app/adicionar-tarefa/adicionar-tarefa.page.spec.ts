import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdicionarTarefaPage } from './adicionar-tarefa.page';

describe('AdicionarTarefaPage', () => {
  let component: AdicionarTarefaPage;
  let fixture: ComponentFixture<AdicionarTarefaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdicionarTarefaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
