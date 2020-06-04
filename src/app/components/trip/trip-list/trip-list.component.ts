import { Component, OnInit } from '@angular/core';
import { TripService } from 'src/app/services/trip.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatableComponent } from '../../shared/translatable/translatable.component';
import { Actor } from 'src/app/models/actor.model';
import { AuthService } from 'src/app/services/auth.service';
import { Trip } from 'src/app/models/trip.model';
import swal from 'sweetalert';
import { FinderService } from 'src/app/services/finder.service';
import { MessageService } from 'src/app/services/message.service';

const MAX_ITEMS = 10;

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.css']
})
export class TripListComponent extends TranslatableComponent implements OnInit {

  numObjects = MAX_ITEMS;

  actor: Actor;
  data: any[];
  roles: string[];

  keyword: string;
  minPrice: string;
  maxPrice: string;
  minDate: string;
  maxDate: string;

  showfilter = true;

  direction: string;

  constructor(private tripService: TripService, public authService: AuthService,
    private translateService: TranslateService, private router: Router,
    private route: ActivatedRoute, private finderService: FinderService, private messageService: MessageService) {
      super(translateService);
      route.queryParams.subscribe(val => this.ngOnInit());
  }

  async ngOnInit() {
    console.log(this.route.url);
    if (this.route.url !== undefined) {
      this.authService.getCurrentActor().then((actor) => {
        this.actor = actor;
          this.route.url.subscribe(url => {
            if (url[0].path !== 'trips-created') {
              if (url[0].path !== 'finder') {
                this.route.queryParams
                .subscribe(async params => {
                  this.keyword = params['keyword'];
                  this.minDate = params['minDate'];
                  this.maxDate = params['maxDate'];
                  this.minPrice = params['minPrice'];
                  this.maxPrice = params['maxPrice'];
                  await this.searchTrips();
                });
              } else {
                this.finderService.getFinderUser(this.actor._id).then(async params => {
                  this.keyword = params['keyword'];
                  this.minDate = params['minDate'];
                  this.maxDate = params['maxDate'];
                  this.minPrice = params['minPrice'];
                  this.maxPrice = params['maxPrice'];
                  await this.searchTrips();
                });
              }
                this.roles = [];
            } else {
              this.showfilter = false;
              this.actor = actor;
              this.tripService.getTripsOfManager(this.actor._id).then((val) => {
                this.data = val;
              });
            }
          });
      });
    } else {
      console.log('test');
      await this.searchTrips();
    }

  }

  async searchTrips() {
    return this.tripService.searchTrips(0, MAX_ITEMS, this.keyword, this.minPrice, this.maxPrice,
      this.minDate, this.maxDate)
      .then((val) => {
        this.data = val;
      })
      .catch((err) => console.error(err.message));
  }

  getFirstPicture(trip: Trip) {
    if ( trip.pictures.length > 0) {
      if (trip.pictures[0] === '') {
        return 'https://i.ya-webdesign.com/images/image-not-available-png-3.png';
      } else {
        return trip.pictures[0];
      }
    } else {
      return 'https://i.ya-webdesign.com/images/image-not-available-png-3.png';
    }
  }

  searchFilter() {
    console.log(this.minPrice);
    this.router.navigate(['/trips/search'], { 'queryParams': {
      'keyword': this.keyword,
      'minPrice': this.minPrice,
      'maxPrice': this.maxPrice,
      'minDate': this.minDate,
      'maxDate': this.maxDate
    }});
  }

  saveFinder() {
    if (this.actor != null && this.actor !== undefined) {
      this.finderService.updateFinderUser({
        'keyword': this.keyword,
        'minPrice': this.minPrice,
        'maxPrice': this.maxPrice,
        'minDate': this.minDate,
        'maxDate': this.maxDate
      }, this.actor._id)
        .then((val) => {
          swal({text: this.translateService.instant('messages.finder.saved'), icon: 'success'});
          // this.messageService.notifyMessage(this.translateService.instant('messages.finder.saved'), 'alert alert-success');
        }, err => {
          swal({text: this.translateService.instant('errorMessages.500'), icon: 'error'});
          // this.messageService.notifyMessage(this.translateService.instant('errorMessages.500'), 'alert alert-danger');
        });
    }

  }

  displayTrip(trip: Trip) {
    const a = new Date();
    const startDate = new Date(trip.startDate);
    return trip.isPublished && (startDate.getTime() >  a.getTime());
  }

  // Functions to infinite scroll

  onScrollDown (ev) {
    if (this.showfilter) {
      const start = this.numObjects;
      this.numObjects += MAX_ITEMS;
      this.appendTrips(start, this.numObjects);
      this.direction = 'down';
    }
  }

  onScrollUp (ev) {
    if (this.showfilter) {
      const start = this.numObjects;
      this.numObjects += MAX_ITEMS;
      this.prependTrips(start, this.numObjects);
      this.direction = 'up';
    }
  }

  appendTrips (startIndex, endIndex) {
    this.addTrips(startIndex, endIndex, 'push');
  }

  prependTrips (startIndex, endIndex) {
    this.addTrips(startIndex, endIndex, 'unshift');
  }

  addTrips (startIndex, endIndex, _method) {
    this.tripService.searchTrips(startIndex, MAX_ITEMS, this.keyword, this.minPrice, this.maxPrice,
      this.minDate, this.maxDate)
      .then((val) => {
        this.data = this.data.concat(val);
      })
      .catch((err) => console.error(err.message));
  }

  showReasonCancel(trip: Trip) {
    swal({
      title: this.translateService.instant('trip.cancel.reason'),
      text: trip.reasonCancel,
      icon: 'info'
    });
  }

  newTrip() {
    this.router.navigate(['/trips-new']);
  }

}
