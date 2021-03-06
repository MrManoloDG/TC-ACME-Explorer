import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TripDisplayComponent } from '../trip-display/trip-display.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslatableComponent } from '../../shared/translatable/translatable.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LocalizedDataPipe } from '../../shared/localized-data.pipe';
import { registerLocaleData, APP_BASE_HREF } from '@angular/common';
import locales from '@angular/common/locales/es';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { Router, ActivatedRouteSnapshot, ActivatedRoute, Params } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { HeaderComponent } from '../../master/header/header.component';
import { RegisterComponent } from '../../security/register/register.component';
import { LoginComponent } from '../../security/login/login.component';
import { EditProfileComponent } from '../../actor/displayProfile/editProfile.component';
import { FooterComponent } from '../../master/footer/footer.component';
import { IndexComponent } from '../../index/index.component';
import { ApplicationDisplayComponent } from '../../application/application-display/application-display.component';
import { NotFoundPageComponent } from '../../shared/not-found-page/not-found-page.component';
import { TermsAndConditionsComponent } from '../../master/terms-and-conditions/terms-and-conditions.component';
import { MessageComponent } from '../../master/message/message.component';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { TripService } from 'src/app/services/trip.service';
import { TripListComponent } from '../trip-list/trip-list.component';
import { DeniedAccessPageComponent } from '../../shared/denied-access-page/denied-access-page.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ApplicationListComponent } from '../../application/application-list/application-list.component';
import { DashboardComponent } from '../../admin/dashboard/dashboard.component';
import { SponsorListComponent } from '../../sponsor/sponsor-list/sponsor-list.component';
import { SponsorDisplayComponent } from '../../sponsor/sponsor-display/sponsor-display.component';
import { NewAuditComponent } from '../../audit/new-audit/new-audit.component';
import { DisplayAuditComponent } from '../../audit/display-audit/display-audit.component';
import { AuditorAuditsComponent } from '../../audit/auditor-audits/auditor-audits.component';
import { DataTableModule } from 'angular-6-datatable';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActorService } from 'src/app/services/actor.service';
import { TripFormComponent } from '../trip-form/trip-form.component';
import { CheckoutComponent } from '../../checkout/checkout.component';
import { ActorListComponent } from '../../actor/actor-list/actor-list.component';
import { NgxPayPalModule } from 'ngx-paypal';
import { AgmCoreModule } from '@agm/core';
import { Actor } from 'src/app/models/actor.model';

registerLocaleData(locales, 'es');

@Injectable()
export class ActivatedRouteStub {
  private subject = new BehaviorSubject(this.testParams);
  params = this.subject.asObservable();

  private _testParams: {};
  get testParams() { return this._testParams; }
  set testParams(params: {}) {
    this._testParams = params;
    this.subject.next(params);
  }
  // ActivatedRoute.snapshot.params
  get snapshot() {
    return { params: this.testParams };
  }
}

describe('TripFormComponent', () => {
  let component: TripFormComponent;
  let fixture: ComponentFixture<TripFormComponent>;
  let mockActivatedRoute;
  let tripService: TripService;
  let originalTimeout;
  let actor: Actor;

  beforeEach(async(() => {
    mockActivatedRoute = new ActivatedRouteStub();
    function HttpLoaderFactory(http: HttpClient) {
      return new TranslateHttpLoader(http);
    }
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        TripFormComponent,
        CheckoutComponent,
        ActorListComponent,
        TripDisplayComponent,
        HeaderComponent,
        TranslatableComponent,
        RegisterComponent,
        LoginComponent,
        EditProfileComponent,
        FooterComponent,
        IndexComponent,
        ApplicationDisplayComponent,
        NotFoundPageComponent,
        TermsAndConditionsComponent,
        TripListComponent,
        DeniedAccessPageComponent,
        ApplicationListComponent,
        DashboardComponent,
        SponsorListComponent,
        SponsorDisplayComponent,
        NewAuditComponent,
        DisplayAuditComponent,
        AuditorAuditsComponent,
        MessageComponent,
        LocalizedDataPipe
      ],
      imports: [
        BrowserModule,
        FormsModule,
        InfiniteScrollModule,
        ReactiveFormsModule,
        HttpClientModule,
        DataTableModule,
        NgxPayPalModule,
        AgmCoreModule.forRoot({
          apiKey: 'AIzaSyBLQG_gHOvvts7C3g_bpuV91TU-GYZHKLA',
          libraries: ['places']
        }),
        AngularFireModule.initializeApp({
          apiKey: 'AIzaSyBLQG_gHOvvts7C3g_bpuV91TU-GYZHKLA',
          authDomain: 'acme-viaje-el-corte-andaluh.firebaseapp.com',
          databaseURL: 'https://acme-viaje-el-corte-andaluh.firebaseio.com',
          projectId: 'acme-viaje-el-corte-andaluh',
          storageBucket: 'acme-viaje-el-corte-andaluh.appspot.com',
          messagingSenderId: '785752393006',
          appId: '1:785752393006:web:b3ba408388312107d6e6bf',
          measurementId: 'G-ZKX46KJLB8'
        }),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        AppRoutingModule,
      ],
      providers: [
        {provide: APP_BASE_HREF, useValue: '/'},
        {
          provide: ActivatedRoute,
          useValue: {
              params: {
                  subscribe: (fn: (value: Params) => void) => fn({
                      id: '200409-LEEM',
                  }),
              },

              url: from([
                  [{
                      path: 'trips',
                  }]
              ]),
          },
      },
        AngularFireAuth, ActorService,
      ],
    })
    .compileComponents();

    actor = new Actor();
    actor._id = '5e941acfb83b5a0019ea9c4f';
    actor.name = 'ext2';
    actor.surname = 'ext2 sur';
    actor.email = 'ext2@gmail.com';
    actor.password = '123456';
    actor.address = 'ext2 address';
    actor.phone = '123456789';
    actor.validated = true;
    actor.role = ['MANAGER'];

    localStorage.setItem('currentActor', JSON.stringify({ actor: actor }));
  }));

  beforeEach(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
    fixture = TestBed.createComponent(TripFormComponent);
    component = fixture.componentInstance;
    mockActivatedRoute.testUrl = [{ path: 'trips'}];
    mockActivatedRoute.testParams = { id: '200409-LEEM' };
    console.log(mockActivatedRoute);
    tripService = TestBed.get(TripService);
    fixture.detectChanges();
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    localStorage.removeItem('currentActor');
  });

  it('should create', async (done) => {
    expect(component).toBeTruthy();
    done();
  });

  it('should have can deactivate', async (done) => {
    expect(component.canDeactivate).toBeDefined();
    done();
  });

  it('should have same trip attributes', async (done) => {
    component.ngOnInit();
    spyOn(tripService, 'getTrip').and.returnValue(Promise.resolve(true));

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.trip_new).toEqual(false);
      expect(component.trip.ticker).toEqual('200409-LEEM');
      expect(component.trip.title).toEqual('Trip1');
      expect(component.trip._id).toEqual('5e8ef80ab5741600198f760c');
      expect(component.trip.price).toEqual(537);
      done();
    });
  });
});
