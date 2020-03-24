import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Trip } from 'src/app/models/trip.model';

@Component({
  selector: 'app-trip-display',
  templateUrl: './trip-display.component.html',
  styleUrls: ['./trip-display.component.css']
})
export class TripDisplayComponent implements OnInit {

  private trip: Trip;
  private pictures: SafeResourceUrl[];

  constructor(private _sanitizer: DomSanitizer) {
    this.trip = new Trip();
    this.trip.ticker = '200610-ASCD';
    this.trip.title = 'Lore Ipsum';
    this.trip.description = 'Deserunt ea id reprehenderit labore elit amet minim esse culpa laboris nisi cupidatat laborum ipsum.'
    + ' Magna ad officia nostrud anim. Amet laborum minim ut et. Anim irure esse nisi ex est non exercitation consectetur laboris '
    + 'commodo est ut non. Pariatur cillum cupidatat nulla id occaecat pariatur elit ut sunt esse cillum commodo incididunt qui. '
    + 'Tempor laboris eu reprehenderit cillum do anim elit esse ea quis adipisicing qui consequat Lorem.';
    this.trip.price = 1423.50;
    this.trip.requirements = [
      'Irure reprehenderit est proident labore.',
      'Mollit consequat cillum veniam ea minim quis proident deserunt excepteur consectetur do dolor cupidatat.',
      'Cillum tempor duis sunt occaecat aliqua culpa.'
    ];
    this.trip.startDate = new Date();
    this.trip.endDate = new Date();
    // tslint:disable-next-line: max-line-length
    this.trip.pictures = ['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'];
    this.trip.manager = '214125215125dawd21';

  }

  ngOnInit() {
  }

  getImageSrc(imageBase64) {
    return this._sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + imageBase64);
  }
}
