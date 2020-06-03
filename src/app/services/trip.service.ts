import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class TripService {

  constructor(
    private http: HttpClient) {
  }

  async getTrip(id: string) {
    const url = `${environment.backendApiBaseURL}/v1/trips/${id}`;
    return this.http.get<Trip>(url).toPromise();
  }

  async getTripById(id: string) {
    const url = `${environment.backendApiBaseURL}/v1/trips/id/${id}`;
    return this.http.get<Trip>(url).toPromise();
  }

  async postTrip(trip: Trip) {
    const url = `${environment.backendApiBaseURL}/v1/trips`;
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify(trip);

    return new Promise<any>((resolve, reject) => {
      this.http.post(url, body, httpOptions).toPromise()
        .then(res => {
          resolve(res);
        }, err => {console.error(err); reject(err); });
    });
  }

  async updateTrip(trip: Trip, id: string) {
    const url = `${environment.backendApiBaseURL}/v1/trips/${id}`;
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify(trip);
    console.log(body);
    return new Promise<any>((resolve, reject) => {
      this.http.put(url, body, httpOptions).toPromise()
        .then(res => {
          resolve(res);
        }, err => {console.error(err); reject(err); });
    });
  }

  async deleteTrip(id: string) {
    const url = `${environment.backendApiBaseURL}/v1/trips/${id}`;
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    this.http.delete(url, httpOptions).toPromise();
  }

  async cancelTrip(cancelReason: string , id: string) {
    const url = `${environment.backendApiBaseURL}/v1/trips/${id}/cancel`;
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const body = JSON.stringify({ reasonCancel: cancelReason });
    console.log(body);
    return new Promise<any>((resolve, reject) => {
      this.http.put(url, body, httpOptions).toPromise()
        .then(res => {
          resolve(res);
        }, err => {console.error(err); reject(err); });
    });
  }

  async publishTrip(id: string) {
    const url = `${environment.backendApiBaseURL}/v1/trips/${id}/publish`;
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    const body = JSON.stringify({});
    return new Promise<any>((resolve, reject) => {
      this.http.put(url, body, httpOptions).toPromise()
        .then(res => {
          resolve(res);
        }, err => {console.error(err); reject(err); });
    });
  }

  getTripsOfManager(id: string) {
    const url = `${environment.backendApiBaseURL}/v1/trips/manager/${id}`;
    return this.http.get<Trip[]>(url).toPromise();
  }

  async searchTrips(start: number, psize: number, keyword: string, minPrice: string, maxPrice: string, minDate: string, maxDate: string) {
    const url = `${environment.backendApiBaseURL}/v1/trips/search`;
    // const url = `${environment.backendApiBaseURL}/v1/trips/search?keyword=${keyword}&minPrice=${minPrice}&maxPrice=${maxPrice}
    // &minDate=${minDate}&maxDate=${maxDate}`;
    const parameters = {
      startFrom: '' + start,
      pageSize: '' + psize,
      keyword: keyword == null ? '' : keyword,
      minPrice: minPrice == null ? '' : minPrice,
      maxPrice: maxPrice == null ? '' : maxPrice,
      minDate: minDate == null ? '' : minDate,
      maxDate: maxDate == null ? '' : maxDate
    };

    if (maxDate == null) {
      delete parameters.maxDate;
    }

    if (minDate == null) {
      delete parameters.minDate;
    }

    if (maxPrice == null) {
      delete parameters.maxPrice;
    }

    if (minPrice == null) {
      delete parameters.minPrice;
    }

    if (keyword == null) {
      delete parameters.keyword;
    }

    return this.http.get<Trip[]>(url, {
      params: parameters, observe: 'body',
    }).toPromise();
  }

  applyTrip(idTrip: string, idExplorer: any) {
    const url = `${environment.backendApiBaseURL}/v1/applications`;
    // return this.http.get<Trip>(url).toPromise();

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');
    const body = JSON.stringify({'explorer': idExplorer, 'trip': idTrip});
    return this.http.post(url, body, httpOptions).toPromise();

  }

}
