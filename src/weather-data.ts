import {Injectable} from '@angular/core'
import {CITIES} from './cities'
import {WeatherAPI} from './weather-api'
import {BehaviorSubject} from 'rxjs/BehaviorSubject'
import {Subject} from 'rxjs/Subject'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/scan'

@Injectable()
export class WeatherData {
  allCities: any[];
  cities: BehaviorSubject<any[]>;
  actions = new Subject();
  constructor(private api:WeatherAPI){
    this.cities = new BehaviorSubject([]);
    this.allCities = CITIES;
    this.actions
      .scan(this._updateState, [])
      .forEach(state => this.cities.next(state));
  }

  addCity(key){
    let city = this.allCities.find(c => c.key === key);
    this.api.fetchCity(city.key)
      .map(cityData => Object.assign({}, cityData, city))
      .map(payload => ({type: 'ADD_CITY', payload: payload}))
      .subscribe(action => this.actions.next(action));
  }
  deleteCity(key){
    this.actions.next({type: 'DELETE_CITY', payload: key});
  }

  private _updateState(state, action){
    switch (action.type) {
      case 'ADD_CITY':
        let exists = state.find(city => city.key === action.payload.key);
        if(exists){
          return state;
        }
        return state.concat([action.payload]);
      case 'DELETE_CITY':
        return state.filter(city => city.key !== action.payload)
      default:
        break;
    }
    return state;
  }
}
