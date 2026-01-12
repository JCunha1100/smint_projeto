import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],
  standalone: false
})
export class LoadingPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // Redireciona para a página de login após 3 segundos
    setTimeout(() => {
      this.router.navigate(['/register-login']);
    }, 3000);
  }

}
