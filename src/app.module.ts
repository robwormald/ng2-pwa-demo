import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {WeatherData} from './weather-data'
import {WeatherAPI} from './weather-api'

import {WeatherApp} from './app'
import {WeatherCard} from './weather-card'
import {CityPicker} from './city-picker'

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    WeatherApp,
    WeatherCard,
    CityPicker,

  ],
  providers: [
    WeatherData,
    WeatherAPI
  ],
  bootstrap: [WeatherApp]
})
export class WeatherAppModule {}
