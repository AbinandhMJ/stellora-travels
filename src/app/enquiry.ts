import {Component,Input,OnInit,signal} from '@angular/core';
import {FormsModule,NgForm} from '@angular/forms';
import {services} from './data';
import {IconComponent} from './icon';
@Component({selector:'st-enquiry',standalone:true,imports:[FormsModule,IconComponent],template:`
<form #form="ngForm" (ngSubmit)="submit(form)" novalidate class="enquiry-form">
<div class="form-heading"><h3>Tell us about your trip</h3><p>Send an enquiry. We'll help with the details.</p></div>
<div class="form-grid">
<label>Your name <span>*</span><input name="name" [(ngModel)]="model.name" required minlength="2" maxlength="100" autocomplete="name" #name="ngModel" [attr.aria-invalid]="invalid(name.invalid,form)" aria-describedby="name-error">@if(invalid(name.invalid,form)){<small class="field-error" id="name-error">Enter your name (at least 2 characters).</small>}</label>
<label>Phone number <span>*</span><input type="tel" name="phone" [(ngModel)]="model.phone" required pattern="[+0-9() .-]{8,20}" maxlength="20" autocomplete="tel" #phone="ngModel" [attr.aria-invalid]="invalid(phone.invalid,form)" aria-describedby="phone-error">@if(invalid(phone.invalid,form)){<small class="field-error" id="phone-error">Enter a valid contact number.</small>}</label>
<label class="full">Email <span class="optional">(optional)</span><input type="email" name="email" [(ngModel)]="model.email" email maxlength="254" autocomplete="email" #email="ngModel" [attr.aria-invalid]="invalid(email.invalid,form)">@if(invalid(email.invalid,form)){<small class="field-error">Enter a valid email address.</small>}</label>
<label>Service <span>*</span><select name="service" [(ngModel)]="model.service" required><option value="">Select a service</option>@for(s of services;track s.id){<option [value]="s.id">{{s.name}}</option>}</select>@if(form.submitted&&!model.service){<small class="field-error">Choose a service.</small>}</label>
<label>{{model.service==='hotel'?'Check-in date':model.service==='visa'?'Intended travel date':'Travel date'}} <span [class.optional]="model.service==='visa'">{{model.service==='visa'?'(optional)':'*'}}</span><input type="date" name="date" [(ngModel)]="model.date" [required]="model.service!=='visa'" [min]="today" #date="ngModel">@if(form.submitted&&((date.invalid)||(model.date&&model.date<today))){<small class="field-error">Choose today or a future date.</small>}</label>
@if(needsPickup()){<label>Pickup location <span>*</span><input name="pickup" [(ngModel)]="model.pickup" required maxlength="160" placeholder="Town, hotel or address" #pickup="ngModel">@if(invalid(pickup.invalid,form)){<small class="field-error">Enter your pickup location.</small>}</label>}
@if(model.service!=='bike'){<label [class.full]="!needsPickup()">{{model.service==='visa'?'Destination country':'Destination'}} <span>*</span><input name="destination" [(ngModel)]="model.destination" required maxlength="160" placeholder="Where would you like to go?" #destination="ngModel">@if(invalid(destination.invalid,form)){<small class="field-error">Enter your destination.</small>}</label>}
<label class="full">Anything else? <span class="optional">(optional)</span><textarea name="message" [(ngModel)]="model.message" rows="3" maxlength="2000" placeholder="Group size, rental duration or anything we should know"></textarea></label>
</div>
<div class="honeypot" aria-hidden="true"><label>Website<input name="website" [(ngModel)]="model.website" tabindex="-1" autocomplete="off"></label></div>
<p class="form-privacy">Your details will be emailed to Stellora Travels to respond to your enquiry. This is not a confirmed booking.</p>
<button type="submit" class="button primary full-button" [disabled]="state()==='sending'">{{state()==='sending'?'Sending enquiry…':'Send enquiry'}}<st-icon name="send"/></button>
@if(state()==='success'){<p class="form-status success" role="status">Your enquiry has been sent. Stellora Travels will contact you using the details provided.</p>}
@if(state()==='error'){<p class="form-status error" role="alert">{{error()}}</p>}
<a class="whatsapp-alternative" [href]="whatsappUrl()" target="_blank" rel="noopener"><st-icon name="brand-whatsapp"/>Prefer WhatsApp? Continue there</a>
</form>
`})
export class EnquiryComponent implements OnInit{
 @Input() initialService=''; @Input() initialDestination='';@Input() initialPickup='';@Input() initialDate='';services=services;
 today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 model={name:'',phone:'',email:'',service:'',date:'',pickup:'',destination:'',message:'',website:''};state=signal<'idle'|'sending'|'success'|'error'>('idle');error=signal('');startedAt=Date.now();
 ngOnInit(){this.model.service=this.initialService;this.model.destination=this.initialDestination;this.model.pickup=this.initialPickup;this.model.date=this.initialDate;}
 needsPickup(){return ['chauffeur','self-drive','airport','tours','wedding','tickets','college'].includes(this.model.service);}
 invalid(value:boolean|null,form:NgForm){return !!value&&form.submitted;}
 whatsappUrl(){const s=services.find(s=>s.id===this.model.service)?.name||'a trip';return 'https://wa.me/918939783708?text='+encodeURIComponent(`Hello Stellora Travels, I'd like to enquire about ${s}.\n${this.model.name?'Name: '+this.model.name+'\n':''}${this.model.pickup?'From: '+this.model.pickup+'\n':''}${this.model.destination?'To: '+this.model.destination+'\n':''}${this.model.date?'Date: '+this.model.date+'\n':''}${this.model.message}`);}
 async submit(form:NgForm){if(this.state()==='sending')return;if(form.invalid||(this.model.date&&this.model.date<this.today)){return;}this.state.set('sending');
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{const res=await fetch('/api/enquiry.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...this.model,startedAt:this.startedAt}),signal:controller.signal});const data=await res.json();if(!res.ok||data.ok!==true)throw new Error(data.message||'We could not send your enquiry. Please try again, call us or use WhatsApp.');this.state.set('success');form.resetForm({service:this.model.service});this.startedAt=Date.now();}
 catch(err){this.state.set('error');this.error.set(err instanceof Error && err.name!=='AbortError' && !['Failed to fetch','fetch failed'].includes(err.message) && err.message&&!err.message.includes('JSON')?err.message:'We could not send your enquiry. Please call us or use WhatsApp.');}finally{clearTimeout(timeout);}}
}
