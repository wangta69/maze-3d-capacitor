import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory} from '@capacitor/filesystem'; // , Encoding
import { RestHttpClient } from 'ng-rest-http';
import {FileSystemService} from '../services/cap-filesystem.service';
import { environment } from '../../environments/environment';

@Injectable()
export class InitService { //  implements OnInit not work

    private gCurrentLinks: any;
    private localDirectory: any;

    private headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*'
    };

    constructor(
        private http: RestHttpClient,
        private filesystemSvc: FileSystemService,

    ) {
        this.localDirectory = '';
        if (Capacitor.isNativePlatform()) { // Check whether the currently running platform is native (ios, android).
            this.localDirectory = Directory.Data; // this.file.dataDirectory
            this.transferGameLinks();
        }
    }

    get currentLinks() {
        return this.gCurrentLinks;
    }

    get localDir() {
        return this.localDirectory;
    }

    public getGameLinks() {
        const links = localStorage.getItem('links');
        if (links) {
            return JSON.parse(links);
        } else {
            return [];
        }
    }


    // 서버에 접근하여 데이타를 가져온다.
    private transferGameLinks() {
        const url = environment.apiServer + '/assets/app-links/links.json';
        this.http.get({url, headers: this.headers}).then((res: any) => {
            if (res.status === 200) { // 현재 데이타를 localStorage에 저장해 둔다.
                this.compareVersion(res.body);
            }
        });
    }
    /**
     * 서버에서 직접 다운 받은 정보와 기존 localStorage에 저장된 정보와 비교하여
     * 아이콘을 다운로드 후 links 정보를 업데이트 한다.
     */
    private async compareVersion(latestLinks: any[]) {
        let latestLinksObj: any = {};
        for (const link of latestLinks) { // someArray mustbe string type
            latestLinksObj[link.marketUrl] = link;
        }
        const links = localStorage.getItem('links');
        let currentLinks = [];
        if (links) {
            currentLinks = JSON.parse(links)
        }

        const currentLinksObj: any  = {};
        for (const link of currentLinks) { // someArray mustbe string type
            currentLinksObj[link.marketUrl] = link;
        }

        for (const key in latestLinksObj) { // someArray mustbe string type
            if (!latestLinksObj.hasOwnProperty(key)) {
                continue;
            }

            // this.iconDownload(latestLinksObj[key].icon);

            if (!currentLinksObj[key]) {
                this.iconDownload(latestLinksObj[key].icon);
            } else if (latestLinksObj[key].ver !== currentLinksObj[key].ver) {
                this.iconDownload(latestLinksObj[key].icon);
            } else {
                try {
                    // const ret =
                    await Filesystem.readFile({
                        path: latestLinksObj[key].icon,
                        directory: Directory.Data
                    });

                } catch (e) {
                    this.iconDownload(latestLinksObj[key].icon);
                }
            }
        }

        localStorage.setItem('links', JSON.stringify(latestLinks));
    }

    private async iconDownload(icon: string) {
        const url = environment.apiServer + '/assets/app-links/' + icon;
        this.filesystemSvc.storeImage(url, icon, 'Data');
    }

    // memory 게임 환경을 초기화 한다.
}
