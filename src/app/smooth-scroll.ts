import {Injectable,PLATFORM_ID,inject} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import Lenis from 'lenis';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
/** Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync. Browser-only; off for prefers-reduced-motion. */
@Injectable({providedIn:'root'})
export class SmoothScroll{
 private browser=isPlatformBrowser(inject(PLATFORM_ID));
 private lenis?:Lenis;
 private tick=(time:number)=>this.lenis?.raf(time*1000);
 start(){
  if(!this.browser)return;
  const mq=window.matchMedia('(prefers-reduced-motion: reduce)');
  const apply=()=>mq.matches?this.stop():this.create();
  apply();mq.addEventListener('change',apply);
 }
 private create(){
  if(this.lenis)return;
  this.lenis=new Lenis({autoRaf:false,lerp:.1,wheelMultiplier:1,anchors:{offset:-110}});
  this.lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(this.tick);gsap.ticker.lagSmoothing(0);
 }
 private stop(){
  if(!this.lenis)return;
  gsap.ticker.remove(this.tick);this.lenis.destroy();this.lenis=undefined;
 }
 /** Jump or glide to a position. Falls back to native scrolling when Lenis is off. */
 scrollTo(target:number|string,opts:{immediate?:boolean}={}){
  if(!this.browser)return;
  if(this.lenis)this.lenis.scrollTo(target as number,{immediate:opts.immediate,offset:typeof target==='string'?-110:0});
  else if(typeof target==='number')window.scrollTo({top:target,behavior:opts.immediate?'auto':'smooth'});
 }
}
