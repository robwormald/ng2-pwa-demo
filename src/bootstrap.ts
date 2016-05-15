import {coreBootstrap, ReflectiveInjector} from '@angular/core';
import {browserPlatform, BROWSER_APP_COMMON_PROVIDERS} from '@angular/platform-browser';
import {WeatherAppNgFactory} from './app.ngfactory';
import {WeatherApp} from './app'

const appInjector = ReflectiveInjector.resolveAndCreate(BROWSER_APP_COMMON_PROVIDERS, browserPlatform().injector);
coreBootstrap(appInjector, WeatherAppNgFactory);

//install service worker if available
// if('serviceWorker' in navigator) {
//     navigator['serviceWorker']
//              .register('./service-worker.js')
//              .then(() => console.log('Service Worker Registered'));
//   }
