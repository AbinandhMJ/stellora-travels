import {bootstrapApplication} from '@angular/platform-browser';
import {provideZonelessChangeDetection} from '@angular/core';
import {provideRouter,withInMemoryScrolling} from '@angular/router';
import {AppComponent} from './app/app';
import {HomeComponent,AboutComponent,ServicesComponent,ContactComponent,NotFoundComponent} from './app/pages';
bootstrapApplication(AppComponent,{providers:[provideZonelessChangeDetection(),provideRouter([
{path:'',component:HomeComponent,title:'Stellora Travels | Kanyakumari Car & Bike Rentals'},
{path:'about-us',component:AboutComponent,title:'About Us | Stellora Travels'},
{path:'services',component:ServicesComponent,title:'Travel Services & Rentals | Stellora Travels'},
{path:'contact-us',component:ContactComponent,title:'Plan Your Trip | Stellora Travels'},
{path:'**',component:NotFoundComponent,title:'Page Not Found | Stellora Travels'}
],withInMemoryScrolling({scrollPositionRestoration:'enabled',anchorScrolling:'enabled'}))]}).catch(console.error);
