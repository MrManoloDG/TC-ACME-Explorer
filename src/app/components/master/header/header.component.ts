import { Component, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { TranslatableComponent } from '../../shared/translatable/translatable.component';
import { AuthService } from 'src/app/services/auth.service';
import { Actor } from 'src/app/models/actor.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent extends TranslatableComponent implements OnInit {
  actor: Actor;
  constructor(private translateService: TranslateService, private authService: AuthService) {
    super(translateService);

  }

  changeLanguage(language: string) {
    super.changeLanguage(language);
  }

  ngOnInit() {
    this.getActorLoggued();
    this.authService.change.subscribe(() => {
      this.getActorLoggued();
    });
  }

  getActorLoggued() {
    this.authService.getCurrentActor().then((actor) => {
      this.actor = actor;
      console.log(this.actor);
    });
  }

  onLogout() {
    this.authService.logout()
      .then(_ => {
        this.actor = null;
      }).catch(error => {
        console.log(error);
      });
  }

}
