import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  RouterModule,Routes } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGaurd } from './services/auth-gaurd.service';
import { TradesComponent } from './trades/trades.component';
import { TradeDetailsComponent } from './trade-details/trade-details.component';

import { FontAwesomeModule,FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from "@fortawesome/free-regular-svg-icons";

import { fab } from '@fortawesome/free-brands-svg-icons'

import { CookieService } from 'ngx-cookie-service';
import { NavComponent } from './nav/nav.component';
import { AddToCollectionsComponent } from './collections/add-to-collections/add-to-collections.component';
import { ViewCollectionsComponent } from './collections/view-collections/view-collections.component';
import { RequestsComponent } from './requests/requests.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { CartComponent } from './cart/cart.component';
import { RequestsContainerComponent } from './requests-container/requests-container.component';
import { RequestsReceivedComponent } from './requests-received/requests-received.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { HomeComponent } from './home/home.component';



const appRoutes:Routes  = [
    { path:'',component:HomeComponent},
    { path:'login',component:LoginComponent},    //localhost:4200/login
    { path:'register',component:RegisterComponent},
    { path:'trades',component:TradesComponent,canActivate:[AuthGaurd]},
    { path:'exchange',component:ExchangeComponent,canActivate:[AuthGaurd]},
    { path:'trades/details',component:TradeDetailsComponent},
    { path:'collections/add-new-books',component:AddToCollectionsComponent, canActivate:[AuthGaurd]},
    { path:'collections/:userID',component:ViewCollectionsComponent,canActivate:[AuthGaurd]},
    
    { path:'requests',component:RequestsContainerComponent, canActivate:[AuthGaurd],children:[
      { path:'sent',component:RequestsComponent, canActivate:[AuthGaurd]},
      { path:'received',component:RequestsReceivedComponent, canActivate:[AuthGaurd]}
    ]},
    { path:'cart',component:CartComponent, canActivate:[AuthGaurd]},
    { path:'**',component:TradesComponent, canActivate:[AuthGaurd]}
    
]
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    TradesComponent,
    TradeDetailsComponent,
    NavComponent,
    AddToCollectionsComponent,
    ViewCollectionsComponent,
    RequestsComponent,
    ExchangeComponent,
    CartComponent,
    RequestsContainerComponent,
    RequestsReceivedComponent,
    LoadingSpinnerComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),
    FontAwesomeModule
  
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule {

    constructor(public library : FaIconLibrary){
        library.addIconPacks(fas,far,fab);
    }
 }
