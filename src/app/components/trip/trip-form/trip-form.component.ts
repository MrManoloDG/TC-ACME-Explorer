import { Component, OnInit } from '@angular/core';
import { TranslatableComponent } from '../../shared/translatable/translatable.component';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { Trip } from 'src/app/models/trip.model';
import { Picture } from 'src/app/models/picture.model';
import { TripService } from 'src/app/services/trip.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Actor } from 'src/app/models/actor.model';
import { AuthService } from 'src/app/services/auth.service';
import { controlNameBinding } from '@angular/forms/src/directives/reactive_directives/form_control_name';
import swal from 'sweetalert';
import { CanComponentDeactivate } from 'src/app/guards/can-deactivate.service';
import { Observable } from 'rxjs';
import { MessageService } from 'src/app/services/message.service';
import { ApplicationsService } from 'src/app/services/applications.service';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.css']
})
export class TripFormComponent extends TranslatableComponent implements OnInit, CanComponentDeactivate {
  actor: Actor;
  tripForm: FormGroup;
  stages: FormArray;
  requeriments: FormArray;
  pictures: FormArray;
  trip = new Trip();
  isNew: boolean;
  totalprice = 0;
  trip_new = true;

  updated: boolean;

  constructor(private fb: FormBuilder, private translateService: TranslateService, private tripService: TripService,
    private router: Router,
    private route: ActivatedRoute, private authService: AuthService, private messageService: MessageService,
    private applicationsService: ApplicationsService) {
    super(translateService);
  }

  ngOnInit() {
    this.updated = false;
    this.createForm();
    if (this.route.url !== undefined) {
      this.route.url.subscribe(url => {
        if (url[0].path !== 'trips-new') {
          this.trip_new = false;
          this.route.params
            .subscribe(async params => {
              this.trip = await this.tripService.getTrip(params['id']);
              if (!this.authService.checkId(this.trip.manager)) {
                this.router.navigate(['/denied-access']);
              } else {
                this.tripForm.controls['title'].setValue(this.trip.title);
                this.tripForm.controls['description'].setValue(this.trip.description);
                this.initRequeriments(this.trip.requeriments);
                this.tripForm.controls['startDate'].setValue(this.formatDate(new Date(this.trip.startDate)));
                this.tripForm.controls['endDate'].setValue(this.formatDate(new Date(this.trip.endDate)));
                this.initPictures(this.trip.pictures);
                this.initStages(this.trip.stages);
                this.totalprice = Number(this.trip.price);
                this.tripForm.controls['price'].setValue(this.totalprice);
              }
            });
        }
      });
    }
    this.authService.getCurrentActor().then((actor) => {
      this.actor = actor;
    this.tripForm.controls['manager'].setValue(this.actor._id);
    });
  }

  getControls(frmGrp: FormGroup, key: string) {
    return (<FormArray>frmGrp.controls[key]).controls;
  }

  formatDate(d: Date) {
    let month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        // tslint:disable-next-line: prefer-const
        year = d.getFullYear();

    if (month.length < 2) {month = '0' + month; }
    if (day.length < 2) {day = '0' + day; }

    return [year, month, day].join('-');
}

  createForm() {
    this.tripForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [ '' , Validators.min(1)],
      requeriments: this.fb.array(['']),
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      pictures: this.fb.array(['']),
      stages: this.fb.array([this.createStage()]),
      manager: ['']
    });
  }

  updatePrice() {
    // Obtenemos los inputs de price de los stages y los recorremos para rellenar
    // El input de precio del trip
    const stages_price = document.getElementsByClassName('price-stage');
    this.totalprice = 0;
    for (let i = 0; i < stages_price.length; i++) {
      const stage = <HTMLInputElement>stages_price[i];
      this.totalprice += Number(stage.value);
    }
    this.tripForm.controls['price'].setValue(this.totalprice);
  }

  createStage() {
    return this.fb.group({
      title: [''],
      description: [''],
      price: ['']
    });
  }

  removeStage(index: number) {
    this.stages.removeAt(index);
    this.updatePrice();
  }

  addStage() {
    this.stages = this.tripForm.get('stages') as FormArray;
    this.stages.push(this.createStage());
  }

  initStages(stagesList: any[]) {
    this.stages = this.tripForm.get('stages') as FormArray;
    stagesList.map(item => {
      this.stages.push(this.fb.group(
        {
          title: [item.title],
          description: [item.description],
          price: [item.price]
        }));
    });
    this.removeStage(0);
    this.tripForm.setControl('stages', this.stages);
  }

  addRequeriments() {
    this.requeriments = this.tripForm.get('requeriments') as FormArray;
    this.requeriments.push(new FormControl(['']));
  }

  removeReq(index: number) {
    this.requeriments.removeAt(index);
  }

  initRequeriments(requerimentsList: string[]) {
    this.requeriments = this.tripForm.get('requeriments') as FormArray;
    requerimentsList.map(item => {
      this.requeriments.push(new FormControl(item));
    });
    this.removeReq(0);
    this.tripForm.setControl('requeriments', this.requeriments);
  }

  addPicture() {
    this.pictures = this.tripForm.get('pictures') as FormArray;
    this.pictures.push(new FormControl(['']));
  }

  removePic(index: number) {
    this.pictures.removeAt(index);
  }

  initPictures(picturesList: string[]) {
    this.pictures = this.tripForm.get('pictures') as FormArray;
    picturesList.map(item => {
      this.pictures.push(new FormControl(item));
    });
    this.removePic(0);
    this.tripForm.setControl('pictures', this.pictures);
  }

  onFileChange(event, i, picture) {
    const reader = new FileReader();
    const showOut = <HTMLTextAreaElement>document.getElementById('showpicresult' + i);
    const pic = <HTMLImageElement>document.getElementById('showpic' + i);
    let res;

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;

      reader.addEventListener('loadend', function () {
        res = reader.result;
        showOut.value = res;
        picture.setValue(res);
        pic.src = res;
      });
      reader.readAsDataURL(file);
    }
  }


  deleteTrip() {
    if (!this.trip_new) {
      this.applicationsService.getTripApplications(this.trip._id).then((val) => {
        if (val.length > 0) {
          swal(this.translateService.instant('errorMessages.trip.have.applications'));
        } else {
          swal({
            title: this.translateService.instant('trip.delete.tit'),
            text: this.translateService.instant('trip.delete.msg'),
            icon: 'warning',
            buttons: [this.translateService.instant('trip.cancel'), this.translateService.instant('trip.delete')],
            dangerMode: true,
          })
          .then((willDelete) => {
            if (willDelete) {
              this.tripService.deleteTrip(this.trip.ticker).then( (val) => {
                this.router.navigate(['/trips-created']);
                swal({text: this.translateService.instant('messages.trip.deleted'), icon: 'success'});
                // this.messageService.notifyMessage(this.translateService.instant('messages.trip.deleted'), 'alert alert-success');
              }, err => {
                if (err.status === 422) {
                  swal({text: this.translateService.instant('errorMessages.422'), icon: 'error'});
                  // this.messageService.notifyMessage(this.translateService.instant('errorMessages.422'), 'alert alert-danger');
                } else {
                  swal({text: this.translateService.instant('errorMessages.500'), icon: 'error'});
                  // this.messageService.notifyMessage(this.translateService.instant('errorMessages.500'), 'alert alert-danger');
                }
              });
            }
          });
        }
      });
    }
  }


  onSubmit() {
    const formTrip = this.tripForm.value;
    if (this.trip_new) {
      this.tripService.postTrip(formTrip).then( val => {
        this.updated = true;
        this.router.navigate(['/trips-created']);
        swal({text: this.translateService.instant('messages.trip.created'), icon: 'success'});
        // this.messageService.notifyMessage(this.translateService.instant('messages.trip.created'), 'alert alert-success');
      }, err => {
        if (err.status === 422) {
          swal({text: this.translateService.instant('errorMessages.422'), icon: 'error'});
          // this.messageService.notifyMessage(this.translateService.instant('errorMessages.422'), 'alert alert-danger');
        } else {
          swal({text: this.translateService.instant('errorMessages.500'), icon: 'error'});
          // this.messageService.notifyMessage(this.translateService.instant('errorMessages.500'), 'alert alert-danger');
        }
      });
    } else {
      this.tripService.updateTrip(formTrip, this.trip.ticker).then( val => {
        this.updated = true;
        this.router.navigate(['/trips-created']);
        swal({text: this.translateService.instant('messages.trip.updated'), icon: 'success'});
        // this.messageService.notifyMessage(this.translateService.instant('messages.trip.updated'), 'alert alert-success');
      }, err => {
        if (err.status === 422) {
          swal({text: this.translateService.instant('errorMessages.422'), icon: 'error'});
          // this.messageService.notifyMessage(this.translateService.instant('errorMessages.422'), 'alert alert-danger');
        } else {
          swal({text: this.translateService.instant('errorMessages.500'), icon: 'error'});
          // this.messageService.notifyMessage(this.translateService.instant('errorMessages.500'), 'alert alert-danger');
        }
      });
    }
  }

  cancelTrip() {
    if (!this.trip_new ) {
      const startDate = new Date(this.trip.startDate);
      startDate.setDate(startDate.getDate() - 7);
      console.log(new Date().getTime() > startDate.getTime());
      if (new Date().getTime() > startDate.getTime() ) {
        return swal({
          text: this.translateService.instant('errorMessages.trip.cancel.date'),
          icon: 'warning',
        });
      } else {
        return swal({
          title: this.translateService.instant('trip.cancel.trip'),
          text: this.translateService.instant('trip.cancel.trip.msg'),
          content: {
            element: 'input'
          },
          buttons: [this.translateService.instant('trip.cancel'), this.translateService.instant('trip.accept')],
        }).then((inputValue) => {
          if (inputValue === false || inputValue == null) {
            return false;
          } else if (inputValue === '') {
            swal(this.translateService.instant('errorMessages.empty.cancel.input'));
            return false;
          } else {
            console.log(inputValue);
            this.tripService.cancelTrip(inputValue, this.trip.ticker).then((val) => {
              this.router.navigate(['/trips-created']);
              swal(this.translateService.instant('messages.trip.canceled'));
            }, err => {
              swal(this.translateService.instant('errorMessages.500'));
            });
          }
        });
      }
    }

  }

  goBack() {
    window.history.back();
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    let result = true;
    const message = this.translateService.instant('messages.discard.changes');
    if (!this.updated && this.tripForm.dirty) {
      return swal({
        text: this.translateService.instant('messages.discard.changes'),
        icon: 'info',
        buttons: [this.translateService.instant('trip.cancel'), this.translateService.instant('trip.discard')],
      })
      .then((willCancel) => {
        result = willCancel;
        return result;
      });
    } else {
      return result;
    }
  }

  publishTrip() {
    this.tripService.publishTrip(this.trip.ticker).then(val => {
      this.trip.isPublished = true;
      swal(this.translateService.instant('messages.trip.published'));
    }, err => {
      swal(this.translateService.instant('errorMessages.500'));
    });
  }

}
