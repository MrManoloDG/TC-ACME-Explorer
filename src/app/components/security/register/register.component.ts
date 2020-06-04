///  <reference path='../../../../../node_modules/@types/googlemaps/index.d.ts'/>

import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import swal from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';
import { TranslatableComponent } from '../../shared/translatable/translatable.component';
import { AuthService } from 'src/app/services/auth.service';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { MessageService } from 'src/app/services/message.service';

declare var google: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent extends TranslatableComponent implements OnInit {
  registrationForm: FormGroup;
  roleList: string[];
  admin = false;

  // google zoom lvl
  zoom = 10;
  // initial center position for the map
  lat = 36.510810;
  lng = -6.278451;
  markers = [];
  autocomplete: any;

  @ViewChild('address')
  public searchElementRef: ElementRef;

  constructor(private translateService: TranslateService, private authService: AuthService,
    private fb: FormBuilder, private router: Router,
    private route: ActivatedRoute, private messageService: MessageService,
    private mapsAPILoader: MapsAPILoader, private ngZone: NgZone) {
    super(translateService);
    this.roleList = this.authService.getRoles();
    this.createForm();
   }

   createForm() {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')],
      password: ['', Validators.required],
      address: ['', Validators.maxLength(50)],
      phone: [''],
      role: ['', Validators.required],
      validated: ['true'] // explorer is validated by default
    });
    this.registrationForm.controls['role'].setValue('EXPLORER');
  }

  ngOnInit() {
    this.route.url.subscribe(url => {
      if (url[0].path === 'new-user') {
        this.admin = true;
        console.log(this.admin);
      }
    });

    this.mapsAPILoader.load().then(() => {
      this.autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ['address']
      });
      this.autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          // get the place result
          const place = this.autocomplete.getPlace();

          this.registrationForm.value.address = place.formatted_address;

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

  mapClicked($event: MouseEvent) {
    this.markers = [];
    this.markers.push({
      lat: $event.coords.lat,
      lng: $event.coords.lng,
      draggable: true
    });

    this.registrationForm.value.address = $event.coords.lat + ';' + $event.coords.lng;
    this.registrationForm.controls['address'].setValue(this.registrationForm.value.address);
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

  onRegister() {
    this.authService.registerUser(this.registrationForm.value)
      .then(res => {
        console.log('Registration success: ' + res);
        swal({text: this.translateService.instant('messages.auth.registration.correct'), icon: 'success'});
        // this.messageService.notifyMessage(this.translateService.instant('messages.auth.registration.correct'), 'alert alert-success');
        if (this.admin) {
          this.router.navigate(['/actors']);
        } else {
          this.router.navigate(['/login']);
        }
      }, err => {
        // console.log(err);
        if (err.code === 'auth/email-already-in-use') {
          swal({text: this.translateService.instant('errorMessages.auth.registration.email.used'), icon: 'error'});
          // this.messageService.notifyMessage(
          //  this.translateService.instant('errorMessages.auth.registration.email.used'), 'alert alert-danger');
        } else {
          swal({text: this.translateService.instant('errorMessages.500'), icon: 'error'});
          // this.messageService.notifyMessage(this.translateService.instant('errorMessages.500'), 'alert alert-danger');
        }
      });
  }

}
