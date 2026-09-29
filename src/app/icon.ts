import {Component,Input} from '@angular/core';
@Component({selector:'st-icon',standalone:true,template:`<img [src]="'/assets/icons/'+name+'.svg'" alt="" aria-hidden="true" width="24" height="24">`})
export class IconComponent{@Input() name='map-pin';}
