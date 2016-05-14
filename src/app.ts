import {Component} from '@angular/core'
import {NgFor} from '@angular/common'
import {WeatherCard} from './weather-card'

@Component({
	selector: 'weather-app',
	templateUrl: 'app.html',
	styleUrls: ['app.css'],
  directives: [NgFor, WeatherCard]
})
export class WeatherApp {
  cities = [{}, {}, {}];
  add(){
    console.log('adding...')
  }
  refresh(){
    console.log('refreshing...')
  }
}
