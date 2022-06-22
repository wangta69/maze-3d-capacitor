import { NgModule, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
// import { AppRate } from '@ionic-native/app-rate/ngx';

@Component({
    selector: 'app-footer',
    template: `
    <hr>
    <footer class="footer">
        <ul>
            <li>
                <button mat-flat-button>
                    <mat-icon class="font24" svgIcon="home">home</mat-icon>
                    <span routerLink="/" routerLinkActive="active">{{ 'footer.home' | translate }}</span>
                </button>
            </li>
            <li>
                <button mat-flat-button routerLink="/daily" routerLinkActive="active">
                    <mat-icon class="font24" svgIcon="calendar">calendar</mat-icon>
                    <span>{{ 'footer.dailychallenge' | translate }}</span>
                </button>
            </li>
            <li>
                <button mat-flat-button (click)="appRating()">
                    <mat-icon class="font24" svgIcon="rate"></mat-icon>
                    <span>{{ 'footer.rate' | translate }}</span>
                </button>
            </li>
        </ul>
    </footer>
    `
})

export class FooterComponent {

    constructor() { // private appRate: AppRate
        // this.appRate.preferences = {
        //     displayAppName: 'Brain Sudoku',
        //     // usesUntilPrompt: 5,
        //     // promptAgainForEachNewVersion: false,
        //     inAppReview: true,
        //     simpleMode: true,
        //
        //     storeAppURL: {
        // //    ios: '<app_id>',
        //         android: 'market://details?id=game.pondol.sudoku.app'
        // //    windows: 'ms-windows-store://review/?ProductId=<store_id>'
        //     }
        //
        // };
    }

    public appRating() {
        // this.appRate.promptForRating(true);
    }
}

@NgModule({
    declarations: [ FooterComponent ],
    imports: [
        RouterModule,
        MatIconModule,
        MatButtonModule,
        TranslateModule
    ],
    exports: [ FooterComponent ]
})
export class FooterModule {}
