import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Audit } from '../models/audit.model';
import { AuthService } from './auth.service';
import { Actor } from '../models/actor.model';
import { MessageService } from './message.service';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  constructor(private http: HttpClient, private authService: AuthService, private messageService: MessageService,
    private translate: TranslateService) {

  }

  getAudit(auditId: String) {

    // obtiene todos los audits de un viaje
    const url = `${environment.backendApiBaseURL}/v1/audits/${auditId}`;

    return this.http.get<Audit>(url).toPromise();
  }

  editAudit(auditId: String, title: String, description: String, atachment: String) {

    return new Promise<any>((resolve, reject) => {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'audit/json');
      const url = `${environment.backendApiBaseURL}/v1/audits/${auditId}`;
      // console.log('url: ' + url);

      const body = JSON.stringify({_id: auditId, title: title, description: description, atachment: atachment});

      this.http.put(url, body, httpOptions).toPromise()
        .then(res => {
          resolve(res);
          const mesAux = this.translate.instant('audits.audit.edit.ok');
          const mes = mesAux + ' [' + auditId + ']';
          swal({text: mes, icon: 'success'});
          // this.messageService.notifyMessage(mes, 'alert alert-success');
        }, err => {
          const mesAux = this.translate.instant('audits.audit.edit.error');
          const  mes = mesAux + ' - ' + err.status + ': ' + err.error;
          swal({text: mes, icon: 'error'});
          // this.messageService.notifyMessage(mes, 'alert alert-danger');
          reject(err);
        });
    });

  }

  newAudit(title: String, description: String, atachment: String, tripId: String, auditorId: String) {

    return new Promise<any>((resolve, reject) => {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'audit/json');
      const url = `${environment.backendApiBaseURL}/v1/audits/`;
      // console.log('url: ' + url);

      const body = JSON.stringify({title: title, description: description, atachment: atachment, trip: tripId, auditor: auditorId});

      this.http.post(url, body, httpOptions).toPromise()
        .then(res => {
          resolve(res);
          const mesAux = this.translate.instant('audits.audit.new.ok');
          const mes = mesAux + ' [' + title + ']';
          swal({text: mes, icon: 'success'});
          // this.messageService.notifyMessage(mes, 'alert alert-success');
        }, err => {
          const mesAux = this.translate.instant('audits.audit.new.error');
          const  mes = mesAux + ' - ' + err.status + ': ' + err.error;
          swal({text: mes, icon: 'error'});
          // this.messageService.notifyMessage(mes, 'alert alert-danger');
          reject(err);
        });
    });

  }

  // usamos funciones async porque se llaman unas a las otras y asi no da error
  async getTripAudits(tripId: String) {

    // obtiene todos los audits de un viaje
    const url = `${environment.backendApiBaseURL}/v1/audits/trips/${tripId}`;

    return this.http.get<Audit[]>(url).toPromise();
  }

  async getAllAuditorAudits() {

    // obtiene todos los audits de un auditor

    let url = '';
    // url = `${environment.backendApiBaseURL}/v1/applications`;

    const actorData = await this.authService.getCurrentActor();
    if (actorData !== null) {
      // console.log('actorData ngOnInit: ' + actorData);
      const userId = actorData._id;
      // console.log('userId: ' + userId);
      url = `${environment.backendApiBaseURL}/v1/audits/users/${userId}`;
      // console.log('url: ' + url);

    } else {
      swal({text: 'User null', icon: 'success'});
      // this.messageService.notifyMessage('User null', 'alert alert-success');

    }

    return this.http.get<Audit[]>(url).toPromise();

  }

}
