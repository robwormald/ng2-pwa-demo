import {Injectable} from '@angular/core'
import {CITIES} from './cities'

@Injectable()
export class WeatherData {
  cities: any[];
  constructor(){
    this.cities = CITIES;
  }
}
