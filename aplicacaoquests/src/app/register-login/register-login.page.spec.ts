import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterLoginPage } from './register-login.page';

describe('RegisterLoginPage', () => {
  let component: RegisterLoginPage;
  let fixture: ComponentFixture<RegisterLoginPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
