import { Injectable, OnInit, EventEmitter, Output } from '@angular/core';
import { Actor } from '../models/actor.model';
import { AngularFireAuth } from 'angularfire2/auth';

import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { MessageService } from './message.service';
import swal from 'sweetalert';

// import { from } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {

  private currentActor: Actor;
  userLoggedIn = new Subject();

  constructor(private fireAuth: AngularFireAuth, private http: HttpClient,
    private router: Router, private route: ActivatedRoute, private messageService: MessageService) {

  }

  @Output() change: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
    //  console.log('Invoking ngOnInit (authService)');
      this.fireAuth.auth.onAuthStateChanged(user => {
          if (user) {
              console.log('-----ACTOR DE FIREBASE----: ', user);
              // this.currentActor = user;
              // this.setCurrentActor(this.currentActor);

              const token = this.fireAuth.auth.currentUser.getIdToken();
              localStorage.setItem('currentActor.token', JSON.stringify(token));
          } else {
              localStorage.removeItem('currentActor');
          }
      });
  }

  logout() {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.auth.signOut()
        .then(_ => {
          this.currentActor = null;
          localStorage.removeItem('currentActor');
          // console.log('logout auth service');
          this.router.navigate(['/index', {name: 'LOGOUT'}]);
          resolve();
        }).catch(error => {
          reject(error);
        });
    });
  }

  login(email: string, password: string) {
    const url = `${environment.backendApiBaseURL}` + `/v1/login?email=${email}&password=${password}`;
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return new Promise<any>((resolve, reject) => {
      this.http.get<Actor>(url).toPromise()
        .then(res => {
          if (res) {
            this.currentActor = res;
            // console.log('actor: ' + res);
            // console.log('actor.name: ' + res.name);
            // console.log('customToken: '+res.customToken);
            // this.userLoggedIn.next(true);
            // this.messageService.notifyMessage('messages.auth.login.correct', 'alert alert-success');
            this.fireAuth.auth.signInWithCustomToken(res.customToken)
              .then(customToken => {
                this.fireAuth.auth.currentUser.getIdToken()
                  .then(
                    (token: string) => {
                      res.idToken = token;
                      this.setCurrentActor(res);
                      this.change.emit();
                      this.userLoggedIn.next(true);
                      // this.messageService.notifyMessage('messages.auth.login.correct', 'alert alert-success');
                      resolve(token);
                    }
                  );
              })
              .catch(error => {
                console.log(error);
                // this.messageService.notifyMessage('messages.auth.login.failed', 'alert alert-danger');
                reject(error);
              });
          } else {
            reject('Only validated clerks can log in');
          }
        }, error => { reject(error); console.log(error); })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  }

  /* registerUser(actor: Actor) {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.auth.createUserWithEmailAndPassword(actor.email, actor.password)
        .then(_ => {
          // Firebase registration was correct, proceed with our backend
          const headers = new HttpHeaders();
          headers.append('Content-Type', 'application/json');
          const url = `${environment.backendApiBaseURL + '/v1/actors'}`;
          const body = JSON.stringify(actor);
          this.http.post(url, body, httpOptions).toPromise()
            .then(res => {
              resolve(res);
            }, err => {
              reject(err);
            });
          // resolve();
        }).catch(error => {
          reject(error);
        });
    });
  } */

  registerUser(actor: Actor) {
    return new Promise<any>((resolve, reject) => {
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      const url = `${environment.backendApiBaseURL + '/v1/actors'}`;
      const body = JSON.stringify(actor);
      this.http.post(url, body, httpOptions).toPromise()
        .then(res => {
          this.fireAuth.auth.createUserWithEmailAndPassword(actor.email, actor.password)
            .then(_ => {
              // Firebase registration was correct
              resolve(res);
            }).catch(error => {
              reject(error);
            });
          // resolve(res);
        }, err => {
          // this.messageService.notifyMessage('messages.auth.login.failed', 'alert alert-danger');
          reject(err);
        });
    });
  }

  setCurrentActor(actor: Actor) {
    localStorage.setItem('currentActor', JSON.stringify({ actor: actor }));
  }

  getCurrentActor(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const currentActor = localStorage.getItem('currentActor');
      if (currentActor) {
        this.currentActor = JSON.parse(currentActor).actor;
        resolve(JSON.parse(currentActor).actor);
      } else {
        resolve(null);
      }
    });
  }

  getRoles(): string[] {
    return ['EXPLORER', 'MANAGER', 'SPONSOR', 'AUDITOR'];
  }

  checkId(id: string) {
    if ( this.currentActor !== undefined && this.currentActor != null) {
      if (this.currentActor._id === id) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  checkRole(role: string) {
    if ( this.currentActor !== undefined && this.currentActor != null) {
      if (this.currentActor.role.includes(role)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }

  }

  checkIsCurrentUser(idIdentifier: string) {
    if ( this.currentActor !== undefined && this.currentActor != null) {
      if (this.currentActor._id === idIdentifier) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }

  }
}
