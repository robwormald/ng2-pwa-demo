import {Component, Output, EventEmitter, Input} from '@angular/core'
import {NgFor} from '@angular/common'
import {WeatherData} from './weather-data'

@Component({
  selector: 'city-picker',
  templateUrl: 'city-picker.html',
  styleUrls: ['city-picker.css'],
  directives: [NgFor]
})
export class CityPicker {
  @Input() cities: any[];
  @Output() save = new EventEmitter();
  @Output() cancel = new EventEmitter();
}
