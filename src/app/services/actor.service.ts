
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Actor } from '../models/actor.model';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { MessageService } from './message.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import swal from 'sweetalert';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

@Injectable()
export class ActorService {

    token: string;
    userRole: string;
    actorUpdated = new Subject();

    constructor(
        private http: HttpClient,
        private authService: AuthService, private messageService: MessageService,
        private translate: TranslateService) {
    }

    getAllActor() {
        const url = `${environment.backendApiBaseURL}/v1/actors`;
        return this.http.get<Actor[]>(url).toPromise();
    }

    getActor(id: string) {
        const url = `${environment.backendApiBaseURL}/v1/actors/${id}`;
        return this.http.get<Actor>(url).toPromise();
    }

    validatedActor(idActor: string, validated: boolean) {

        return new Promise<any>((resolve, reject) => {
            const headers = new HttpHeaders();
            headers.append('Content-Type', 'actor/json');
            const url = `${environment.backendApiBaseURL}/v1/actors/${idActor}/validated`;
            // console.log('url: ' + url);
            // console.log('validated: ' + validated);

            const body = JSON.stringify({_id: idActor, validated: validated});

            let mes;
            if (validated) {
                // validated = true => usuario activo
                const mesAux = this.translate.instant('actor.unbanned.ok');
                mes = mesAux + ' [' + idActor + ']';

            } else {
                // validated = false => usuario inactivo
                const mesAux = this.translate.instant('actor.banned.ok');
                mes = mesAux + ' [' + idActor + ']';

            }
            this.http.put(url, body, httpOptions).toPromise()
              .then(res => {
                swal({text: mes, icon: 'success'});
                // this.messageService.notifyMessage(mes, 'alert alert-success');
                this.actorUpdated.next(true);
                resolve(res);
              }, err => {
                swal({text: mes, icon: 'success'});
                // this.messageService.notifyMessage(mes, 'alert alert-danger');
                this.actorUpdated.next(false);
                reject(err);
              });
          });
    }

    updateProfile(actor: Actor, id: string) {
        const url = `${environment.backendApiBaseURL}/v1/actors/${id}`;
        //const putActor = JSON.parse(JSON.stringify(actor));
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        headers.append('idtoken', actor.idToken);

        const body = JSON.stringify(actor);

        return new Promise<any>((resolve, reject) => {
            this.http.put(url, body, httpOptions).toPromise()
                .then(res => {
                    resolve(res);
                }, err => { console.log(err); reject(err); });
        });
    }
}
