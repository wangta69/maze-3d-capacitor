import { NgModule, Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core'; // Plugins

import { CommonModule} from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { FabSpeedDialModule } from '../components/fab-speed-dial/fab-speed-dial.module';
import { NativeMarket } from '../components/native-market';
import { InitService } from '../services/init.service';
import {FileSystemService} from '../services/cap-filesystem.service';

import { environment } from '../../environments/environment';

@Component({
    selector: 'app-gamelinks',
    template: `
    <eco-fab-speed-dial direction='up'>
        <eco-fab-speed-dial-trigger>
            <button mat-fab class='more-app' (click)="refreshData()">
                <div class="inner-txt">
                    <span>More</span>
                    <span>Apps</span>
                </div>

            </button>
        </eco-fab-speed-dial-trigger>

        <eco-fab-speed-dial-actions>
            <button mat-mini-fab  *ngFor="let game of games" (click)="gotoMarket(game.marketUrl)" >
                <img [src]="game.iconUrl">
                <label>{{game.text}}</label>
            </button>
        </eco-fab-speed-dial-actions>
    </eco-fab-speed-dial>
    `,
    styleUrls: ['./gamelinks.scss']
})

export class GameLinkComponent implements OnInit {
    games: any;
    localDir: string = '';
    constructor(
        // private market: Market,
        private initSvc: InitService,
        private filesystemSvc: FileSystemService,
        // private platform: Platform,
    ) {

    }
    ngOnInit() {
        this.getMarketList();
    }

    private async getMarketList() {
        if (Capacitor.isNativePlatform()) { // native 일경우는 데이타를 저장하여 사용한다.(offline 에서도 가능하게)
            const tmp = [];
            const links = this.initSvc.getGameLinks();
            const localDir = await this.filesystemSvc.getDir('Data');

            this.localDir = localDir.uri;

            for (const link of links) { //
                if (link.marketUrl !== environment.appId) {
                    const filePath = this.localDir + '/' + link.icon;
                    link.iconUrl = Capacitor.convertFileSrc(filePath);
                    tmp.push(link);
                }
            }
            this.games = tmp;
        } else { // web 일경우는 바로가져온다.
            const tmp = [];
            const links = this.initSvc.getGameLinks();
            for (const link of links) { //
                if (link.marketUrl !== environment.appId) {
                    link.iconUrl = environment.apiServer + '/assets/app-links/' + link.icon;
                    tmp.push(link);
                }
            }
            this.games = tmp;

        }

    }

    public refreshData() {
        this.getMarketList();
    }

    public async gotoMarket(id: string) {
        // NativeMarket['openStoreListing']({
        if (Capacitor.isNativePlatform()) {
            NativeMarket.openStoreListing({
               appId: id,
            });
        }
    }
}

@NgModule({
    declarations: [ GameLinkComponent ],
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        FabSpeedDialModule,
        // TranslateModule,
    ],
    exports: [ GameLinkComponent ],
    providers: [
        // Market
    ]
})
export class GameLinkModule {}
