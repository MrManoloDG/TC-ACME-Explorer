import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Actor } from '../../../models/actor.model';
import { ActorService } from '../../../services/actor.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message.service';
import { TranslateService } from '@ngx-translate/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { TranslatableComponent } from '../../shared/translatable/translatable.component';
import { Observable } from 'rxjs';
import swal from 'sweetalert';
import { CanComponentDeactivate } from 'src/app/guards/can-deactivate.service';

declare var google: any;

@Component({
  selector: 'app-edit-profile',
  templateUrl: './editProfile.component.html',
  styleUrls: ['./editProfile.component.css']
})
export class EditProfileComponent implements OnInit, CanComponentDeactivate {
  profileForm: FormGroup;
  actor: Actor;
  errorMessage: string;

  updated: boolean;

    // google zoom lvl
    zoom = 10;
    // initial center position for the map
    lat = 36.510810;
    lng = -6.278451;
    markers = [];
    autocomplete: any;

  @ViewChild('address')
  public searchElementRef: ElementRef;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private actorService: ActorService,
    private router: Router,
    private messageService: MessageService,
    private translate: TranslateService,
    private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {
    }

  ngOnInit() {
    this.updated = false;
    this.createForm();
    this.mapsAPILoader.load().then(() => {
      this.autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ['address']
      });
      this.autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          // get the place result
          const place = this.autocomplete.getPlace();

          this.profileForm.value.address = place.formatted_address;

          // verify result
          if (place.geometry === undefined ||  place.geometry === null) {
            return;
          }

          // set latitude, longitude and zoom
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
          this.zoom = 16;

          this.markers = [];
          this.markers.push({
            lat: this.lat,
            lng: this.lng,
            draggable: true
          });
        });
      });
    });
  }

  createForm() {
    this.actor = new Actor();

    this.profileForm = this.fb.group({
      //id: [''],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')],
      //password: [''],
      address: ['', Validators.maxLength(50)],
      //language:[''],
      phone:['']
    });

    //this.profileForm.controls['password'].setValue('');
    this.actor = new Actor();

    this.authService.getCurrentActor().then(
      (actorData: Actor) => {
        if (actorData) {
          this.actor = actorData;
          //this.profileForm.controls['id'].setValue(this.actor._id);
          this.profileForm.controls['name'].setValue(this.actor.name);
          this.profileForm.controls['surname'].setValue(this.actor.surname);
          this.profileForm.controls['email'].setValue(this.actor.email);
          // this.profileForm.controls['password'].setValue(this.actor.password);
          this.profileForm.controls['address'].setValue(this.actor.address);
          //this.profileForm.controls['language'].setValue(this.actor.language);
          this.profileForm.controls['phone'].setValue(this.actor.phone);

          if (this.actor.address == null) {
            this.setCurrentPosition();
          } else {
            const coords = this.actor.address.split(';');
            console.log('Split: ' + coords);
            console.log(coords != null && coords.length === 2);
            if (coords != null && coords.length === 2) {
              this.markers.push({
                lat: coords[0],
                lng: coords[1],
                draggable: true
              });
            }
          }

        } else {
          console.log('error getting current actor: ' + JSON.stringify(actorData));
        }
      }).catch(err => console.log(err));
  }

  mapClicked($event: MouseEvent) {
    this.markers = [];
    this.markers.push({
      lat: $event.coords.lat,
      lng: $event.coords.lng,
      draggable: true
    });

    this.profileForm.value.address = $event.coords.lat + ';' + $event.coords.lng;
    this.profileForm.controls['address'].setValue(this.profileForm.value.address);
  }

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      console.log('Geolocating');
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  onSubmit() {
    console.log('boton guardar editar');
    console.log(this.profileForm.errors);
    if (this.profileForm.valid) {
      const formModel = this.profileForm.value;
      this.actor.name = formModel.name;
      this.actor.surname = formModel.surname;
      //this.actor.password = formModel.password;
      this.actor.email = formModel.email;
      this.actor.address = formModel.address;
      //this.actor.language = formModel.language;
      this.actor.phone = formModel.phone;

      this.authService.getCurrentActor()
        .then(actor => {
          this.actorService.updateProfile(formModel, this.actor._id)
            .then((val) => {
              this.updated = true;
              console.log(val);
              this.authService.setCurrentActor(val);
              const mesAux = this.translate.instant('actor.edit.success');
              const mes = mesAux + this.actor.email;
              // this.errorMessage = mes;
              this.errorMessage = '';
              swal({text: this.translate.instant('actor.edit.success') + this.actor.email , icon: 'success'});
              // this.messageService.notifyMessage(mes, 'alert alert-success');
              // this.router.navigate(['/index']);
            })
            .catch((err) => {
              this.errorMessage = err.statusText;
              console.error(err);
            });
      })
      .catch((err) => {
        this.errorMessage = err.statusText;
        console.error(err);
      });
    } else {
      console.log('error');
      swal({text: this.translate.instant('errorMessages.422'), icon: 'error'});
      // this.messageService.notifyMessage(this.translate.instant('errorMessages.422'), 'alert alert-danger');
    }

  }

  goBack(): void {
    // this.router.navigate(['/']);
    window.history.back();
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    let result = true;
    const message = this.translate.instant('messages.discard.changes');
    if (!this.updated && this.profileForm.dirty) {
      return swal({
        text: this.translate.instant('messages.discard.changes'),
        icon: 'info',
        buttons: [this.translate.instant('trip.cancel'), this.translate.instant('trip.discard')],
      })
      .then((willCancel) => {
        result = willCancel;
        return result;
      });
    } else {
      return result;
    }
  }

}

