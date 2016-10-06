import {Component, Output, EventEmitter, Input} from '@angular/core'
import {WeatherData} from './weather-data'

@Component({
  selector: 'city-picker',
  templateUrl: './city-picker.html',
  styleUrls: ['./city-picker.css'],
})
export class CityPicker {
  @Input() cities: any[];
  @Output() save = new EventEmitter();
  @Output() cancel = new EventEmitter();
}
