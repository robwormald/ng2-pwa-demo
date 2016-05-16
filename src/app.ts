import {Component, Renderer, ViewChild, QueryList, ElementRef, AfterViewInit, NgZone, ApplicationRef} from '@angular/core'
import {NgFor, NgIf, NgClass} from '@angular/common'
import {WeatherCard} from './weather-card'
import {CityPicker} from './city-picker'
import {WeatherAPI} from './weather-api'
import {WeatherData} from './weather-data'


@Component({
	selector: 'weather-app',
	templateUrl: 'app.html',
	styleUrls: ['app.css'],
  directives: [NgFor, NgIf, NgClass, WeatherCard, CityPicker],
  providers: [WeatherAPI, WeatherData]
})
export class WeatherApp {
  viewState = {}
  cities = [];
  constructor(public weatherAPI:WeatherAPI, public renderer:Renderer, public app:ApplicationRef){


  }

  showPicker(){
    this.setDialogState(true);
  }
  addCity(city){
    this.setDialogState(false);
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
