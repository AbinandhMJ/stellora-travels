import {Routes} from '@angular/router';
import {HomeComponent,AboutComponent,ServicesComponent,ContactComponent,NotFoundComponent} from './pages';
export const routes:Routes=[
{path:'',component:HomeComponent,title:'Stellora Travels | Kanyakumari Car & Bike Rentals'},
{path:'about-us',component:AboutComponent,title:'About Us | Stellora Travels'},
{path:'services',component:ServicesComponent,title:'Travel Services & Rentals | Stellora Travels'},
{path:'contact-us',component:ContactComponent,title:'Plan Your Trip | Stellora Travels'},
{path:'**',component:NotFoundComponent,title:'Page Not Found | Stellora Travels'}
];
