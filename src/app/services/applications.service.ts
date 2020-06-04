import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Application } from '../models/application.model';
import { AuthService } from './auth.service';
import { Actor } from '../models/actor.model';
import { MessageService } from './message.service';
import { Subject } from 'rxjs';
import { InfoMessage } from '../models/info-message.model';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ApplicationsService {

  appliUpdated = new Subject();

  constructor(
    private http: HttpClient, private authService: AuthService, private messageService: MessageService,
    private translate: TranslateService) {
  }

  // usamos funciones async porque se llaman unas a las otras y asi no da error

  async getExplorerApplications() {
    let url = '';
    // url = `${environment.backendApiBaseURL}/v1/applications`;

    const actorData = await this.authService.getCurrentActor();
    if (actorData !== null) {
      // console.log('actorData ngOnInit: ' + actorData);
      const userId = actorData._id;
      // console.log('userId: ' + userId);
      url = `${environment.backendApiBaseURL}/v1/applications/users/${userId}`;
      // console.log('url: ' + url);

    } else {
      // this.messageService.notifyMessage('User null', 'alert alert-success');
      swal({text: 'User null', icon: 'success'});
    }

    return this.http.get<Application[]>(url).toPromise();
  }

  async getTripApplications(tripId: String) {
    const url = `${environment.backendApiBaseURL}/v1/applications/trips/${tripId}`;
      // console.log('url: ' + url);
    return this.http.get<Application[]>(url).toPromise();
  }

  updateApplyToDue(itemId: String) {

    return new Promise<any>((resolve, reject) => {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      const url = `${environment.backendApiBaseURL}/v1/applications/${itemId}`;
      // console.log('url: ' + url);
      const body = JSON.stringify({status: 'DUE'}); // no es necesario pasarle el estado, se encarga el backend
      this.http.put(url, body, httpOptions).toPromise()
        .then(res => {
          resolve(res);
          // this.messageService.notifyMessage('application.update.due.ok', 'alert alert-success');
          swal({text: this.translate.instant('application.update.due.ok'), icon: 'success'});
          this.appliUpdated.next(true);
        }, err => {
          // this.messageService.notifyMessage('application.update.due.error', 'alert alert-danger');
          swal({text: this.translate.instant('application.update.due.error'), icon: 'success'});
          this.appliUpdated.next(false);
          reject(err);
        });
    });

  }

  payApplication(itemId: String) {

    return new Promise<any>((resolve, reject) => {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      const url = `${environment.backendApiBaseURL}/v1/applications/${itemId}`;
      // console.log('url: ' + url);
      const body = JSON.stringify({status: 'ACCEPTED'}); // no es necesario pasarle el estado, se encarga el backend
      this.http.put(url, body, httpOptions).toPromise()
        .then(res => {
          resolve(res);
          const mesAux = this.translate.instant('paypal.pay.ok');
          const mes = mesAux + ' [' + itemId + ']';
          // this.messageService.notifyMessage(mes, 'alert alert-success');
          swal({text: mes, icon: 'success'});
          this.appliUpdated.next(true);
        }, err => {
          const mesAux = this.translate.instant('paypal.pay.error');
          const mes = mesAux + ' - ' + err.status + ': ' + err.error;
          // this.messageService.notifyMessage(mes, 'alert alert-danger');
          swal({text: mes, icon: 'error'});
          this.appliUpdated.next(false);
          reject(err);
        });
    });

  }

  getApplicationById(applyId: String) {
    const url = `${environment.backendApiBaseURL}/v1/applications/${applyId}`;
    // console.log('url: ' + url);
    return this.http.get<Application>(url).toPromise();
  }

  cancelApplication(applyId: String, reasonCancel: String) {

    return new Promise<any>((resolve, reject) => {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      const url = `${environment.backendApiBaseURL}/v1/applications/${applyId}/cancel`;

      // si es manager es obligatorio el reason cancel, si es explorer no
      this.authService.getCurrentActor()
        .then((actorData: Actor) => {
          if (actorData !== null) {
              const actorRole = actorData.role;
              // console.log('role: ' + actorRole);

              let body, mes;
              if (this.authService.checkRole('MANAGER')) {
                // tiene rol manager, reasonCancel es obligatorio y pasa a estado REJECTED
                body = JSON.stringify({status: 'REJECTED', reasonCancel: reasonCancel});
                const mesAux = this.translate.instant('application.rejected.ok');
                mes = mesAux + ' [' + applyId + ']';

              } else if (this.authService.checkRole('EXPLORER')) {
                // tiene rol explorer, pasa a estado CANCELLED
                body = JSON.stringify({status: 'CANCELLED', reasonCancel: reasonCancel});
                const mesAux = this.translate.instant('application.cancel.ok');
                mes = mesAux + ' [' + applyId + ']';

              }

              this.http.put(url, body, httpOptions).toPromise()
                .then(res => {
                  resolve(res);
                  // this.messageService.notifyMessage(mes, 'alert alert-success');
                  swal({text: mes, icon: 'success'});
                }, err => {
                  const mesAux = this.translate.instant('application.cancel.error');
                  mes = mesAux + ' - ' + err.status + ': ' + err.error;
                  // this.messageService.notifyMessage(mes, 'alert alert-danger');
                  swal({text: mes, icon: 'error'});
                  // console.log('err: ' + err.error);
                  reject(err);
                });

          } else {
            console.log('error getting current actor: ' + JSON.stringify(actorData));
          }
        }).catch(err => console.log(err));
    });

  }

  editApplication(applyId: String, comment: String, reasonCancel: String) {

    return new Promise<any>((resolve, reject) => {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      const url = `${environment.backendApiBaseURL}/v3/applications/${applyId}`;
      // console.log('url: ' + url);
      // console.log('comment: ' + comment);

      const body = JSON.stringify({_id: applyId, comment: comment, reasonCancel: reasonCancel});

      this.http.put(url, body, httpOptions).toPromise()
        .then(res => {
          resolve(res);
          const mesAux = this.translate.instant('application.edit.ok');
          const mes = mesAux + ' [' + applyId + ']';
          // this.messageService.notifyMessage(mes, 'alert alert-success');
          swal({text: mes, icon: 'success'});
        }, err => {
          const mesAux = this.translate.instant('application.edit.error');
          const  mes = mesAux + ' - ' + err.status + ': ' + err.error;
          // this.messageService.notifyMessage(mes, 'alert alert-danger');
          swal({text: mes, icon: 'error'});
          reject(err);
        });
    });

  }

  /* getApplications() {
    let url = '';
    // url = `${environment.backendApiBaseURL}/v1/applications`;

    this.authService.getCurrentActor()
      .then( (actorData: Actor) => {
        // console.log('actorData subscribe ngOnInit: ' + actorData);

        if (actorData !== null) {
          // console.log('actorData ngOnInit: ' + actorData);
          const userId = actorData._id;
          console.log('userId: ' + userId);
          url = `${environment.backendApiBaseURL}/v1/applications/users/${userId}`;
          console.log('url: ' + url);
          return this.http.get<Application[]>(url).toPromise();
        }

      })
    .catch( (err) => {
      console.log(err);
      this.messageService.notifyMessage(err, 'alert alert-success');
    });
    return this.http.get<Application[]>(url).toPromise();
  } */

}
