import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-registar',
  templateUrl: './registar.page.html',
  styleUrls: ['./registar.page.scss'],
  standalone: false
})
export class RegistarPage implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.registerForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador customizado para verificar se as passwords coincidem
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const { nome, email, password } = this.registerForm.value;
      
      // Aqui você implementaria a lógica de registro com backend
      console.log('Registro:', { nome, email, password });

      // Mostrar mensagem de sucesso
      const alert = await this.alertController.create({
        header: 'Sucesso!',
        message: `Bem-vindo, ${nome}! Sua conta foi criada.`,
        buttons: [{
          text: 'OK',
          handler: () => {
            this.router.navigate(['/tabs/home']);
          }
        }]
      });

      await alert.present();
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
