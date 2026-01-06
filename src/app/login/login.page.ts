import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const { email, password, rememberMe } = this.loginForm.value;
      
      // Aqui você implementaria a lógica de autenticação com backend
      console.log('Login:', { email, password, rememberMe });

      // Simulação de login bem-sucedido
      const alert = await this.alertController.create({
        header: 'Bem-vindo!',
        message: 'Login realizado com sucesso.',
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

  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Password',
      message: 'Funcionalidade em desenvolvimento. Será implementada em breve.',
      buttons: ['OK']
    });

    await alert.present();
  }

  goToRegister() {
    this.router.navigate(['/registar']);
  }

}
