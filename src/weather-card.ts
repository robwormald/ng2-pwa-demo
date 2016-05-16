import {Component, Input} from '@angular/core'
import {NgClass, NgIf, JsonPipe} from '@angular/common'

export interface CurrentConditions {
  icon: string;
}

export interface City {
  currently:CurrentConditions;
  daily:any;
  flags:any;
  name:string;
}

@Component({
	selector: 'weather-card',
	templateUrl: 'weather-card.html',
	styleUrls: ['weather-card.css'],
  directives: [NgClass, NgIf],
  pipes:[JsonPipe]
})
export class WeatherCard {
 name:string;
 icon: any;
 @Input() set city(city:City){
   this.name = city.name;
   this.icon = city['currently'].icon;
 };
}


