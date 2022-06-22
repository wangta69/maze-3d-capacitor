import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core'; // Plugins
import { environment } from '../../../environments/environment';

import { NativeMarket } from '../../components/native-market';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-games',
    templateUrl: 'component.html',
    styleUrls: ['component.scss']
})
export class GamesPage implements OnInit {
    public games: any;

    constructor(
        // private market: Market,
        private http:HttpClient,
        // private initSvc: InitService,
        // private filesystemSvc: FileSystemService,
        // private platform: Platform,
    ) {
        this.getMarketList();
    }
    ngOnInit() {

    }

    private async getMarketList() {
        this.http.get('assets/app-links/links.json')
            .subscribe((data) => {
                this.games = this.shuffle(data);
            });
    }

    public async gotoMarket(id: string) {
        // NativeMarket['openStoreListing']({
        if (Capacitor.isNativePlatform()) {
            NativeMarket.openStoreListing({
               appId: id,
            });
        }
    }

    private shuffle(array: any) {
        let currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex != 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }


}
