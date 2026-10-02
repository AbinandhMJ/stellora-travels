import {Component,signal,inject,HostListener,PLATFORM_ID,afterNextRender} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {RouterOutlet,RouterLink,RouterLinkActive,Router,NavigationEnd} from '@angular/router';
import {Meta} from '@angular/platform-browser';
import {SmoothScroll} from './smooth-scroll';
import {IconComponent} from './icon';
const PAGES:Record<string,{title:string;desc:string}>={
 '/':{title:'Stellora Travels | Kanyakumari Car & Bike Rentals',desc:'Explore Kanyakumari and Trivandrum with Stellora Travels. Car and bike rentals, airport transfers and customised tours.'},
 '/about-us':{title:'About Us | Stellora Travels',desc:'Meet Stellora Travels, your Kanyakumari base for car and bike rentals, tours and travel assistance.'},
 '/services':{title:'Travel Services & Rentals | Stellora Travels',desc:'Explore Stellora car and bike rentals, airport drops, customised tours, wedding transport and booking assistance.'},
 '/contact-us':{title:'Plan Your Trip | Stellora Travels',desc:'Send your travel enquiry to Stellora Travels in Kanyakumari. Office hours: 5 AM to 12 noon IST.'}
};
@Component({selector:'app-root',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive,IconComponent],template:`
<a class="skip-link" href="#main">Skip to content</a>
<div class="scroll-progress" aria-hidden="true"><span [style.width.%]="scrollProgress()"></span></div>
<header class="site-header"><a routerLink="/" aria-label="Stellora Travels home" class="brand"><img src="/assets/logo.webp" width="218" height="62" alt="Stellora Travels. Your journey, our priority."></a>
<nav class="desktop-nav" aria-label="Main navigation"><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a><a routerLink="/about-us" routerLinkActive="active">About Us</a><a routerLink="/services" routerLinkActive="active">Services</a><a routerLink="/contact-us" routerLinkActive="active">Contact Us</a></nav>
<a class="header-call" href="tel:+918939783708"><st-icon name="phone"/><span>+91 89397 83708</span></a>
<button class="menu-button" (click)="menuOpen.set(!menuOpen())" [attr.aria-expanded]="menuOpen()" aria-controls="mobile-menu" [attr.aria-label]="menuOpen()?'Close navigation':'Open navigation'"><st-icon [name]="menuOpen()?'x':'menu-2'"/></button>
@if(menuOpen()){<nav id="mobile-menu" class="mobile-nav" aria-label="Mobile navigation"><a routerLink="/" (click)="menuOpen.set(false)">Home</a><a routerLink="/about-us" (click)="menuOpen.set(false)">About Us</a><a routerLink="/services" (click)="menuOpen.set(false)">Services</a><a routerLink="/contact-us" (click)="menuOpen.set(false)">Contact Us</a><a href="tel:+918939783708">Call +91 89397 83708</a></nav>}
</header>
<main id="main" tabindex="-1"><router-outlet/></main>
<footer class="footer"><div class="container footer-grid"><div class="footer-brand"><a routerLink="/" class="footer-logo"><img src="/assets/logo.webp" alt="Stellora Travels" width="240" height="68" loading="lazy"></a><p>Your journey. Our priority.<br>Travel starts here in Kanyakumari.</p></div><div><h2>Explore</h2><a routerLink="/">Home</a><a routerLink="/about-us">About Us</a><a routerLink="/services">Services</a><a routerLink="/contact-us">Contact Us</a></div><div><h2>Get in touch</h2><a href="tel:+918939783708">+91 89397 83708</a><a href="mailto:stelloratravels@gmail.com">stelloratravels&#64;gmail.com</a><p>Office hours<br>5:00 AM to 12:00 noon IST</p></div><div><h2>Find us</h2><p>No. 21, First Floor, behind Indian Bank,<br>Church Road, Kanyakumari 629702.</p><a class="footer-map" href="https://maps.app.goo.gl/NKSd1zCMPByPvWEq5" target="_blank" rel="noopener">View on Google Maps</a></div></div><div class="container footer-bottom"><span>© {{year}} Stellora Travels. All rights reserved.</span><button (click)="creditsOpen.set(!creditsOpen())" [attr.aria-expanded]="creditsOpen()">Image credits</button></div>
@if(creditsOpen()){<div class="container credits"><p>Destination photographs are travel inspiration, not Stellora trip photographs. Vehicle images are generated illustrations, not a representation of the available fleet.</p><a href="/assets/image-credits.txt" target="_blank" rel="noopener">View destination photograph sources and licences</a></div>}
</footer>
<button class="back-to-top" type="button" [class.visible]="showBackToTop()" [attr.aria-hidden]="!showBackToTop()" [attr.tabindex]="showBackToTop()?0:-1" aria-label="Back to top" (click)="backToTop()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg></button>
<a class="floating-contact" href="https://wa.me/918939783708?text=Hello%20Stellora%20Travels%2C%20I%27d%20like%20to%20enquire%20about%20a%20trip." target="_blank" rel="noopener" aria-label="Enquire on WhatsApp"><st-icon name="brand-whatsapp"/><span>Let's talk travel</span></a>
`})
export class AppComponent{
 menuOpen=signal(false);creditsOpen=signal(false);scrollProgress=signal(0);showBackToTop=signal(false);year=new Date().getFullYear();
 private router=inject(Router);private meta=inject(Meta);private smooth=inject(SmoothScroll);private browser=isPlatformBrowser(inject(PLATFORM_ID));
 constructor(){
  afterNextRender(()=>{this.smooth.start();this.updateScrollState();});
  this.router.events.subscribe(e=>{if(e instanceof NavigationEnd){
   this.menuOpen.set(false);
   const path=e.urlAfterRedirects.split('?')[0].split('#')[0];const url=path||'/';const hasFragment=e.urlAfterRedirects.includes('#');
   const page=PAGES[url]??PAGES['/'];
   this.meta.updateTag({name:'description',content:page.desc});
   this.meta.updateTag({property:'og:title',content:page.title});
   this.meta.updateTag({property:'og:description',content:page.desc});
   if(this.browser){if(!hasFragment)this.smooth.scrollTo(0,{immediate:true});setTimeout(()=>this.updateScrollState());}
  }});
 }
 @HostListener('window:scroll') @HostListener('window:resize')
 updateScrollState(){
  if(!this.browser)return;
  const top=window.scrollY||document.documentElement.scrollTop;const available=document.documentElement.scrollHeight-window.innerHeight;
  this.scrollProgress.set(available>0?Math.min(100,(top/available)*100):0);this.showBackToTop.set(top>500);
 }
 backToTop(){this.smooth.scrollTo(0);}
}
