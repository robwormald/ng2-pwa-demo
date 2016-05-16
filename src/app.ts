import {Component, Renderer, ViewChild, QueryList, ElementRef, AfterViewInit, NgZone, ApplicationRef} from '@angular/core'
import {NgFor} from '@angular/common'
import {WeatherCard} from './weather-card'
import {CityPicker} from './city-picker'
import {WeatherAPI} from './weather-api'
import {WeatherData} from './weather-data'


@Component({
	selector: 'weather-app',
	templateUrl: 'app.html',
	styleUrls: ['app.css'],
  directives: [NgFor, WeatherCard, CityPicker],
  providers: [WeatherAPI, WeatherData]
})
export class WeatherApp implements AfterViewInit{
  cities = [];
  constructor(public weatherAPI:WeatherAPI, public renderer:Renderer, public app:ApplicationRef){


  }
  ngAfterViewInit(){

  }
  add(){
    this.cities.push({name: 'test'})
  }
  refresh(){
    console.log('refreshing...')
  }
}
