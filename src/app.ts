import {Component, Renderer, ViewChild, QueryList, ElementRef, AfterViewInit, NgZone, ApplicationRef, provide} from '@angular/core'
import {NgFor, NgIf, NgClass, AsyncPipe} from '@angular/common'
import {WeatherCard} from './weather-card'
import {CityPicker} from './city-picker'

import {WeatherData} from './weather-data'

@Component({
	selector: 'weather-app',
	templateUrl: 'app.html',
	styleUrls: ['app.css'],
  directives: [NgFor, NgIf, NgClass, WeatherCard, CityPicker],
  pipes: [],
  providers: []
})
export class WeatherApp {
  viewState = {}
  cities = [];
  constructor(public weatherData:WeatherData){
    weatherData.cities
      .subscribe(cities => this.cities = cities);
  }

  showPicker(){
    this.setDialogState(true);
  }
  addCity(city){
    this.setDialogState(false);
    this.weatherData.addCity(city);
  }
  onCancel(event){
    this.setDialogState(false);
  }
  refresh(){
    console.log('refreshing...')
  }
  private setDialogState(show:boolean){
    this.viewState['dialog-container--visible'] = show;
  }
}
