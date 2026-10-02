import {Directive,ElementRef,OnDestroy,afterNextRender,inject} from '@angular/core';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
/** Page motion. Runs in the browser only (afterNextRender), so prerendering never touches window/matchMedia. */
@Directive({selector:'[stMotion]',standalone:true})
export class MotionDirective implements OnDestroy{
 private el=inject<ElementRef<HTMLElement>>(ElementRef);private context?:gsap.Context;private media?:gsap.MatchMedia;
 constructor(){afterNextRender(()=>this.init());}
 private init(){
  const root=this.el.nativeElement;
  this.context=gsap.context(()=>{
   this.media=gsap.matchMedia();
   this.media.add('(prefers-reduced-motion: no-preference)',()=>{
    if(root.querySelector('.hero')){
      // Entrance. Avoid fading the large hero image or the headline so the first paint stays the largest paint.
      gsap.from('.hero-copy > :not(h1)',{y:28,opacity:0,duration:.85,stagger:.12,delay:.15,ease:'power3.out'});
      gsap.from('.hero-copy h1',{y:36,clipPath:'inset(0% 0% 100% 0%)',duration:1,ease:'power3.out',clearProps:'clipPath,transform'});
      gsap.from('.hero-scenery img',{scale:1.18,duration:1.8,ease:'power2.out'});
      gsap.from('.hero-suv',{x:160,duration:1.2,delay:.2,ease:'power3.out'});
      gsap.from('.hero-scooter',{x:-90,opacity:0,duration:1.1,delay:.45,ease:'power3.out'});
    }
    gsap.utils.toArray<HTMLElement>('.reveal',root).forEach(el=>gsap.from(el,{y:28,opacity:0,duration:.7,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
    // Hero depth: layers drift at different speeds while the hero scrolls away. Uses percent transforms so it never fights the entrance tweens.
    const hero=root.querySelector<HTMLElement>('.hero');
    if(hero){
     gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}})
      .fromTo('.hero-scenery img',{yPercent:-6},{yPercent:6},0)
      .to('.hero-suv',{xPercent:14,yPercent:-5,scale:1.06},0)
      .to('.hero-scooter',{xPercent:-32,yPercent:10},0)
      .to('.sun-disc',{xPercent:-45,yPercent:75,scale:1.3},0)
      .to('.hero-copy',{yPercent:-10},0)
      .to('.place-card',{yPercent:-55},0);
    }
    // Image parallax inside overflow-hidden frames. The constant scale keeps the edges covered while the image travels.
    gsap.utils.toArray<HTMLElement>('.parallax-image',root).forEach(el=>gsap.fromTo(el,{yPercent:-5,scale:1.12},{yPercent:5,scale:1.12,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}}));
   });
   this.media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)',()=>{
    const section=root.querySelector<HTMLElement>('.services-pan');const track=root.querySelector<HTMLElement>('.services-track');
    if(section&&track){gsap.to(track,{x:()=>-Math.max(0,track.scrollWidth-section.clientWidth+48),ease:'none',scrollTrigger:{trigger:section,start:'top top',end:()=>'+='+Math.max(1,track.scrollWidth-section.clientWidth),pin:true,scrub:true,invalidateOnRefresh:true}});}
    const panels=gsap.utils.toArray<HTMLElement>('.spotlight',root);
    panels.slice(0,-1).forEach((panel,i)=>{ScrollTrigger.create({trigger:panel,start:'top 100px',endTrigger:panels[i+1],end:'top 100px',pin:true,pinSpacing:false});gsap.to(panel,{scale:.94,opacity:.6,ease:'none',scrollTrigger:{trigger:panels[i+1],start:'top 85%',end:'top 100px',scrub:true}});});
    const journey=root.querySelector<HTMLElement>('.journey');
    const cleanups:Array<()=>void>=[];
    if(journey)cleanups.push(this.journey(journey));
    return()=>cleanups.forEach(fn=>fn());
   });
  },root);
  document.fonts.ready.then(()=>{if(this.context)ScrollTrigger.refresh()});
 }
 /** Pinned "coast road" story: a car follows the SVG route south to north while each stop's photo wipes in. Desktop only. */
 private journey(section:HTMLElement){
  const stage=section.querySelector<HTMLElement>('.journey-stage');const path=section.querySelector<SVGPathElement>('.journey-path');const car=section.querySelector<SVGGElement>('.journey-car');
  const stops=gsap.utils.toArray<SVGGElement>('.journey-stop',section);const cards=gsap.utils.toArray<HTMLElement>('.journey-card',section);
  if(!stage||!path||!car||stops.length<2||stops.length!==cards.length)return()=>{};
  section.classList.add('is-pinned');
  const len=path.getTotalLength();const last=stops.length-1;
  stops.forEach((g,i)=>{const pt=path.getPointAtLength(len*i/last);g.setAttribute('transform',`translate(${pt.x} ${pt.y})`);const label=g.querySelector('text');const left=pt.x>170;label?.setAttribute('x',String(left?-18:18));label?.setAttribute('text-anchor',left?'end':'start');});
  const place=(p:number)=>{const pt=path.getPointAtLength(len*p);car.setAttribute('transform',`translate(${pt.x} ${pt.y})`);};place(0);
  gsap.set(path,{strokeDasharray:len,strokeDashoffset:len});
  gsap.set(cards.slice(1).map(c=>c.firstElementChild),{clipPath:'inset(100% 0% 0% 0%)'});
  gsap.set(stops.map(g=>g.querySelector('text')),{opacity:.4});
  const dots=stops.map(g=>g.querySelector('.journey-dot'));const labels=stops.map(g=>g.querySelector('text'));
  gsap.set(dots[0],{fill:'#f5c711'});gsap.set(labels[0],{opacity:1});
  const progress={p:0};
  const tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:stage,start:'top 120px',end:()=>'+='+Math.round(window.innerHeight*.75*last),pin:true,scrub:true,invalidateOnRefresh:true}});
  tl.to(path,{strokeDashoffset:0,duration:last},0).to(progress,{p:1,duration:last,onUpdate:()=>place(progress.p)},0);
  for(let i=1;i<=last;i++){
   const at=i-.55;
   tl.to(cards[i].firstElementChild,{clipPath:'inset(0% 0% 0% 0%)',duration:.55},at)
     .fromTo(cards[i].querySelector('img'),{scale:1.15},{scale:1,duration:.55},at)
     .to(dots[i],{fill:'#f5c711',duration:.1},i-.1).to(labels[i],{opacity:1,duration:.1},i-.1);
  }
  tl.to({},{duration:.35},last);
  return()=>{section.classList.remove('is-pinned');};
 }
 ngOnDestroy(){this.media?.revert();this.context?.revert();this.context=undefined;}
}
