import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsorDisplayComponent } from './sponsor-display.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppComponent } from 'src/app/app.component';
import { ApplicationListComponent } from '../../application/application-list/application-list.component';
import { HeaderComponent } from '../../master/header/header.component';
import { TranslatableComponent } from '../../shared/translatable/translatable.component';
import { RegisterComponent } from '../../security/register/register.component';
import { LoginComponent } from '../../security/login/login.component';
import { EditProfileComponent } from '../../actor/displayProfile/editProfile.component';
import { FooterComponent } from '../../master/footer/footer.component';
import { IndexComponent } from '../../index/index.component';
import { ApplicationDisplayComponent } from '../../application/application-display/application-display.component';
import { NotFoundPageComponent } from '../../shared/not-found-page/not-found-page.component';
import { TermsAndConditionsComponent } from '../../master/terms-and-conditions/terms-and-conditions.component';
import { DeniedAccessPageComponent } from '../../shared/denied-access-page/denied-access-page.component';
import { MessageComponent } from '../../master/message/message.component';
import { LocalizedDataPipe } from '../../shared/localized-data.pipe';
import { TripListComponent } from '../../trip/trip-list/trip-list.component';
import { TripDisplayComponent } from '../../trip/trip-display/trip-display.component';
import { SponsorListComponent } from '../sponsor-list/sponsor-list.component';
import { DashboardComponent } from '../../admin/dashboard/dashboard.component';
import { NewAuditComponent } from '../../audit/new-audit/new-audit.component';
import { AuditorAuditsComponent } from '../../audit/auditor-audits/auditor-audits.component';
import { DisplayAuditComponent } from '../../audit/display-audit/display-audit.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { RouterTestingModule } from '@angular/router/testing';
import { DataTableModule } from 'angular-6-datatable';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AngularFireModule } from 'angularfire2';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AngularFireAuth } from 'angularfire2/auth';
import { ActorService } from 'src/app/services/actor.service';
import { APP_BASE_HREF, registerLocaleData } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { from, BehaviorSubject } from 'rxjs';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Injectable } from '@angular/core';
import { SponsorshipService } from 'src/app/services/sponsorship.service';
import { TripFormComponent } from '../../trip/trip-form/trip-form.component';
import { CheckoutComponent } from '../../checkout/checkout.component';
import { ActorListComponent } from '../../actor/actor-list/actor-list.component';
import { NgxPayPalModule } from 'ngx-paypal';
import { AgmCoreModule } from '@agm/core';


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

describe('SponsorDisplayComponent', () => {
  let mockActivatedRoute;
  let originalTimeout;
  let component: SponsorDisplayComponent;
  let sponsorshipService: SponsorshipService;
  let fixture: ComponentFixture<SponsorDisplayComponent>;

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
        ApplicationListComponent,
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
        DeniedAccessPageComponent,
        MessageComponent,
        LocalizedDataPipe,
        TripListComponent,
        TripDisplayComponent,
        SponsorListComponent,
        SponsorDisplayComponent,
        DashboardComponent,
        NewAuditComponent,
        AuditorAuditsComponent,
        DisplayAuditComponent
      ],
      imports: [
        BrowserModule,
        FormsModule,
        InfiniteScrollModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        DataTableModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
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
        AppRoutingModule,
      ],
      providers: [
        {provide: APP_BASE_HREF, useValue: '/'},
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        AngularFireAuth, ActorService,
      ],
    })
    .compileComponents();
  }));

 beforeEach(() => {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
    fixture = TestBed.createComponent(SponsorDisplayComponent);
    component = fixture.componentInstance;
    mockActivatedRoute.testParams = { id: '5e94a29fb83b5a0019eaa9ec' };
    sponsorshipService = TestBed.get(SponsorshipService);
    fixture.detectChanges();
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('should not be null', async (done) => {
    component.ngOnInit();
    fixture.detectChanges();
    spyOn(sponsorshipService, 'getSponsorshipById').and.returnValue(Promise.resolve(true));

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.sponsorship).not.toBeNull();
      done();
    });
  });
});
