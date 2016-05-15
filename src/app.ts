import {Component, Renderer, ViewChild, QueryList, ElementRef, AfterViewInit, NgZone} from '@angular/core'
import {NgFor} from '@angular/common'
import {WeatherCard} from './weather-card'
import {CityPicker} from './city-picker'
import {WeatherAPI} from './services/weather-api'
import {WeatherData} from './services/weather-data'

@Component({
	selector: 'weather-app',
	templateUrl: 'app.html',
	styleUrls: ['app.css'],
  directives: [NgFor, WeatherCard, CityPicker],
  providers: [WeatherAPI, WeatherData]
})
export class WeatherApp implements AfterViewInit{
  cities = [];
  constructor(public weatherAPI:WeatherAPI, public renderer:Renderer, public _zone:NgZone){
    window['Comp'] = this;
  }
  ngAfterViewInit(){

  }
  add(){
   this._zone.run(() => {
      this.cities = [{id: 1}]
   })
    //this.renderer.setElementClass(this.cityPicker.nativeElement, 'dialog-container--visible', true)
  }
  refresh(){
    console.log('refreshing...')
  }
}
