import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { RestHttpClientModule } from 'ng-rest-http';

import { AdMobService } from './services/cap-admob.service';
import { ConfigService } from './services/config.service';
import { LocalNotificationService } from './services/cap-local-notification.service';
import { EventService } from './services/event.service';

import { GameComponent } from './game/game.component';
import { HeaderModule } from './common/header';
import { PolicyPage } from './pages/policy/policy.component';
import { GamesPage } from './pages/games/component';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    PolicyPage,
    GamesPage,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    RestHttpClientModule,
    TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
    HeaderModule,

  ],
  providers: [
      ConfigService,
      AdMobService,
      LocalNotificationService,
      EventService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
