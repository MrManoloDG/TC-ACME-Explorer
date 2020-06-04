import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslatableComponent } from '../../shared/translatable/translatable.component';
import { Actor } from 'src/app/models/actor.model';
import { MessageService } from 'src/app/services/message.service';
import swal from 'sweetalert';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent extends TranslatableComponent implements OnInit {
  actor: Actor;
  email: string;
  errorMessage: string;
  registerSuccess: string;
  returnUrl: string;

  constructor(private translateService: TranslateService, private authService: AuthService,
    private router: Router, private route: ActivatedRoute, private messageService: MessageService) {
    super(translateService);
    this.registerSuccess = 'false';
  }

  ngOnInit(): void {
    // esto es para que aparezca un mensaje cuando se ha registrado correctamente el usuario
    this.registerSuccess = this.route.snapshot.paramMap.get('registerSuccess');
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onLogout() {
    this.authService.logout()
      .then(_ => {
        this.email = null;
        console.log('logout');
      }).catch(error => {
        console.log(error);
        this.errorMessage = error;
      });
  }

  onLogin(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    if (email === '' || password === '') {
      this.messageService.notifyMessage(this.translateService.instant('errorMessages.auth.login.empty.fields'), 'alert alert-danger');
      swal({text: this.translateService.instant('errorMessages.auth.login.empty.fields'), icon: 'error'});
    } else {
      this.authService.login(email, password).then(_ => {
        form.reset();
        this.email = email;
         this.router.navigate(['/index', {name: this.email}]);
        // this.router.navigateByUrl(this.returnUrl);
        // console.log('data: ' + data); // devuelve el token
      }).catch((error) => {
        // console.log(error);
        if (error.code === 'auth/argument-error') {
          this.messageService.notifyMessage(this.translateService.instant('errorMessages.auth.argument.error'), 'alert alert-danger');
          swal({text: this.translateService.instant('errorMessages.auth.argument.error'), icon: 'error'});
        } else {
          if (error.status === 401) {
            this.messageService.notifyMessage(this.translateService.instant('errorMessages.auth.wrong.login'), 'alert alert-danger');
            swal({text: this.translateService.instant('errorMessages.auth.wrong.login'), icon: 'error'});
          } else {
            this.messageService.notifyMessage(this.translateService.instant('errorMessages.auth.login.not.login'), 'alert alert-danger');
            swal({text: this.translateService.instant('errorMessages.auth.login.not.login'), icon: 'error'});
          }
        }
        // this.errorMessage = 'Error Login: ' + error;
      });
    }
  }

  onclickEditProfile() {
    this.router.navigate(['/profile/edit']);
  }
}


