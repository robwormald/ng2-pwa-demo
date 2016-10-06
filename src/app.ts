import {Component, Renderer, ViewChild, QueryList, ElementRef, AfterViewInit, NgZone, ApplicationRef} from '@angular/core'

import {WeatherData} from './weather-data'

@Component({
	selector: 'weather-app',
	templateUrl: './app.html',
	styleUrls: ['./app.css'],
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
    this.weatherData.refreshData();
  }
  private setDialogState(show:boolean){
    this.viewState['dialog-container--visible'] = show;
  }
}
