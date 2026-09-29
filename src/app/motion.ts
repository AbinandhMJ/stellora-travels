import {AfterViewInit,Directive,ElementRef,OnDestroy,inject} from '@angular/core';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
@Directive({selector:'[stMotion]',standalone:true})
export class MotionDirective implements AfterViewInit,OnDestroy{
 private el=inject<ElementRef<HTMLElement>>(ElementRef); private context?:gsap.Context; private media?:gsap.MatchMedia;
 ngAfterViewInit(){
 this.context=gsap.context(()=>{
 this.media=gsap.matchMedia();
 this.media.add('(prefers-reduced-motion: no-preference)',()=>{
 gsap.from('.hero-copy > *',{y:28,opacity:0,duration:.85,stagger:.12,ease:'power3.out'});
 gsap.from('.hero-scenery',{scale:1.05,opacity:0,duration:1.4,ease:'power2.out'});
 gsap.from('.hero-suv',{x:130,opacity:0,duration:1.2,delay:.25,ease:'power3.out'});
 gsap.from('.hero-scooter',{x:-70,opacity:0,duration:1.1,delay:.45,ease:'power3.out'});
 gsap.utils.toArray<HTMLElement>('.reveal',this.el.nativeElement).forEach(el=>gsap.from(el,{y:28,opacity:0,duration:.7,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
 });
 this.media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)',()=>{
 const section=this.el.nativeElement.querySelector<HTMLElement>('.services-pan');const track=this.el.nativeElement.querySelector<HTMLElement>('.services-track');
 if(section&&track){gsap.to(track,{x:()=>-Math.max(0,track.scrollWidth-section.clientWidth+48),ease:'none',scrollTrigger:{trigger:section,start:'top top',end:()=>'+='+Math.max(1,track.scrollWidth-section.clientWidth),pin:true,scrub:1,invalidateOnRefresh:true}});}
 const panels=gsap.utils.toArray<HTMLElement>('.spotlight',this.el.nativeElement);
 panels.slice(0,-1).forEach((panel,i)=>{ScrollTrigger.create({trigger:panel,start:'top 100px',endTrigger:panels[i+1],end:'top 100px',pin:true,pinSpacing:false});gsap.to(panel,{scale:.94,opacity:.6,ease:'none',scrollTrigger:{trigger:panels[i+1],start:'top 85%',end:'top 100px',scrub:true}});});
 gsap.utils.toArray<HTMLElement>('.parallax-image',this.el.nativeElement).forEach(el=>gsap.fromTo(el,{yPercent:-5},{yPercent:5,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:1}}));
 });
 },this.el.nativeElement);
 document.fonts.ready.then(()=>{if(this.context)ScrollTrigger.refresh()});
 }
 ngOnDestroy(){this.media?.revert();this.context?.revert();this.context=undefined;}
}
