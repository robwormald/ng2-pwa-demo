import {coreBootstrap, ReflectiveInjector, provide, enableProdMode} from '@angular/core';
import {browserPlatform, BROWSER_APP_COMMON_PROVIDERS} from '@angular/platform-browser';
import {WeatherAppNgFactory} from './app.ngfactory';
import {WeatherApp} from './app'
import {WeatherData} from './weather-data'
import {WeatherAPI} from './weather-api'


let APP_PROVIDERS = [WeatherData, WeatherAPI];
enableProdMode();
const appInjector = ReflectiveInjector.resolveAndCreate(BROWSER_APP_COMMON_PROVIDERS.concat(...APP_PROVIDERS), browserPlatform().injector);
coreBootstrap(appInjector, WeatherAppNgFactory);

//install service worker if available
if('serviceWorker' in navigator) {
    navigator['serviceWorker']
             .register('./service-worker.js')
             .then(() => console.log('Service Worker Registered'));
  }
