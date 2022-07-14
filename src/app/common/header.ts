import { NgModule, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';

import { Share } from '@capacitor/share';

import { TranslateModule } from '@ngx-translate/core';
import { GameSettingDialogComponent, GameSettingIconComponent } from './setting';

import { environment } from '../../environments/environment';
@Component({
    selector: 'app-header',
    template: `
    <header>
        <div class="title">
             <a href="/"><img src="/assets/icon/favicon.png"></a>
        </div>
        <div class="end">
            <span (click)="share()">
                <mat-icon svgIcon="share"></mat-icon>
            </span>
            <span>
                <a href='/games'>
                    <mat-icon svgIcon="controller"></mat-icon>
                </a>
            </span>
            <game-setting></game-setting>
        </div>
    </header>
    `,
    styleUrls: ['header.scss']
})

export class HeaderComponent {

    constructor() { // , private router: Router
    }

    async share() {
        const  url = 'https://play.google.com/store/apps/details?id=' + environment.appId
        await Share.share({
          title: environment.appName,
          text: 'This reallly funny game',
          url: url,
          dialogTitle: 'Share with buddies',
        });
    }
}

@NgModule({
    declarations: [
        HeaderComponent,
        GameSettingDialogComponent,
        GameSettingIconComponent
    ],
    entryComponents: [
        GameSettingDialogComponent
    ],
    imports: [
        RouterModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatSlideToggleModule,
        MatSliderModule,
        TranslateModule
    ],
    exports: [ HeaderComponent ]
})
export class HeaderModule {}
