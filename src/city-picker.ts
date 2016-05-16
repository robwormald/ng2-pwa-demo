import {Component, Output, EventEmitter} from '@angular/core'

@Component({
  selector: 'city-picker',
  templateUrl: 'city-picker.html',
  styleUrls: ['city-picker.css']
})
export class CityPicker {
  @Output() save = new EventEmitter();
  @Output() cancel = new EventEmitter();
}
