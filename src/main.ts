import 'zone.js/dist/zone.js'
import {enableProdMode} from '@angular/core';
import {platformBrowser} from '@angular/platform-browser';
import {WeatherAppModule} from './app.module'
import {WeatherAppModuleNgFactory} from './ngfactory/src/app.module.ngfactory';

enableProdMode();
platformBrowser().bootstrapModuleFactory(WeatherAppModuleNgFactory)
//install service worker if available
if('serviceWorker' in navigator) {
    navigator['serviceWorker']
             .register('./service-worker.js')
             .then(() => console.log('Service Worker Registered'));
  }
