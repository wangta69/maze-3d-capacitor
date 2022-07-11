import { Component, OnInit, OnDestroy } from '@angular/core';
import { Capacitor } from '@capacitor/core'; // Plugins,PluginRegistry,
import { App, AppState } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService} from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LocalNotificationService } from './services/cap-local-notification.service';
import { ConfigService } from './services/config.service';
import { AdMobService } from './services/cap-admob.service';
import { EventService } from './services/event.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy { //  implements OnInit, OnDestroy
    private ngUnsubscribe = new Subject();
    constructor(
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private translate: TranslateService,
        private configSvc: ConfigService,
        private admobService: AdMobService,
        private notificationSvc: LocalNotificationService,
        private eventSvc: EventService
    ) {
        this.initTranslate(); // 위치중요  initializeApp 보다 선행되어 호출되어야 함
        this.initializeApp();
    }

    ngOnInit() {
        App.addListener('appStateChange', (state: AppState) => {
            if(state.isActive) {
                this.eventSvc.broadcast('platform', {status: 'resume'});
            } else {
                this.eventSvc.broadcast('platform', {status: 'pause'});
            }
        });

        this.configSvc.getLanguage()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((lan) => {
            this.translate.use(lan);
        });

        this.iconRegistry
            // .addSvgIcon('help', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/svg/question-circle-regular.svg'))
            .addSvgIcon('settings', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/svg/baseline-settings-20px.svg'))
            .addSvgIcon('controller', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/svg/controller-icon.svg'))
            // .addSvgIcon('rate', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/svg/baseline-rate_review-24px.svg'))
            // .addSvgIcon('pause', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/svg/baseline-pause-24px.svg'))
            // .addSvgIcon('play-arrow', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/svg/baseline-play_arrow-24px.svg'))
            // .addSvgIcon('close', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/svg/outline-close-24px.svg'))
            // .addSvgIcon('crop-din', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/svg/outline-crop_din-24px.svg'))
            // .addSvgIcon('delete-sweep', this.sanitizer.bypassSecurityTrustResourceUrl('./assets/svg/delete_sweep-24px.svg'))
            ;
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(null);
        this.ngUnsubscribe.complete();
    }

    private async keepAwake() {
        await KeepAwake.keepAwake();
    };

    private async setLocalMessage() {
        this.translate.get('localpushmessage')
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(async (value) => {
            // console.log(value);
            // const randomId = Math.floor(Math.random() * 10000) + 1;
            // const randomId = 1;
            const notification = {
                title: value,
                body: 'Thank you for using this app.',
                id: 1,
                schedule: {
                  // at: new Date(Date.now() + 1000 * 60), // in a minute
                  // on: {hour: 9, minute: 33, second: 0},
                    on: {hour: 8, minute: 5},
                   allowWhileIdle: true,
                  // every: "day"
                },
            };

            await this.notificationSvc.schedule(notification);
        });
    }

    private initTranslate() {
        this.translate.setDefaultLang('en');

        const lan = navigator.language.split('-')[0];
        this.translate.use(lan);
        this.configSvc.language = lan;
   }

    private async initializeApp(): Promise<void> {
        if (Capacitor.isNativePlatform()) {
            this.keepAwake();
            this.setLocalMessage();

            if (Capacitor.isPluginAvailable('StatusBar')) {
                // iOS only
                window.addEventListener('statusTap', function () {
                  console.log('statusbar tapped');
                });
                StatusBar.setOverlaysWebView({ overlay: false });
                await StatusBar.setStyle({ style: Style.Dark });
                await StatusBar.show();
            };


            await this.admobService.initialize();
            this.admobService.BannerAdPluginEvents((result: any) => {
                // console.log('BannerAdPluginEvents:', JSON.stringify(result))
            });

            this.admobService.showBanner(environment.admob.banner);
        }
    }
}
