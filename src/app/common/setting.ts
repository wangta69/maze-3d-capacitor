import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';
import { ConfigService } from '../services/config.service';
// import { Market } from '@ionic-native/market/ngx';
// import { AppVersion } from '@ionic-native/app-version/ngx';
import { NativeMarket } from '../components/native-market';
import { environment } from '../../environments/environment';

interface Langulages {
  language: string;
  country: string;
}

@Component({
  selector: 'game-dialog',
  templateUrl: 'setting.html',
  styleUrls: ['./setting.scss']
})
export class GameSettingDialogComponent implements OnInit {
    sound = true;
    vibration = true;
    version =  '';
    language: string | any;
    template: any;
    languages: Langulages[] = [
        {language: 'en', country: 'English'},
        {language: 'da', country: 'Dansk'},
        {language: 'it', country: 'italiano'},
        {language: 'ja', country: '日本語'},
        {language: 'ko', country: '한국어'},
        {language: 'vi', country: 'ngôn ngữ tiếng Việt'},
        {language: 'zh', country: '中文'}
    ];

    templates: any = [
        {template: 'icon', type: 'type2'},
        {template: 'button', type: 'type1'},


    ];

    constructor(
        private coinfigSvc: ConfigService,
        private dialogRef: MatDialogRef<GameSettingDialogComponent>,
    ) {

    }

    ngOnInit() {
        this.sound = this.coinfigSvc.sound;
        this.language = this.coinfigSvc.language;
        this.vibration = this.coinfigSvc.vibration;
        this.template = this.coinfigSvc.template;
        console.log('this.coinfigSvc.template', this.coinfigSvc.template);
        this.version = environment.appVersion.toString();
    }

    setSound(e: any): void {
        this.sound = e.checked;
        this.coinfigSvc.setSound(this.sound);
    }

    setVibration(e: any): void {
        this.vibration = e.checked;
        this.coinfigSvc.setVibration(this.vibration);
    }

    setLanguage(e: any): void {
        this.language = e.value;
        // 이곳에서 바로 언어를 변경해 준다.
        this.coinfigSvc.setLanguage(e.value);
    }

    setTestLanguage(lan: string): void {
        this.coinfigSvc.setLanguage(lan);
    }

    setTemplate(e: any): void {
        this.template = e.value;
        this.coinfigSvc.setTemplate(e.value);
    }

    public appRating() {
        if (Capacitor.isNativePlatform()) {
            NativeMarket.openStoreListing({
               appId: environment.appId,
            });
        }
        // this.market.open(environment.appId);
    }

    public gotoLink() {
        this.dialogRef.close();
    }
}

@Component({
  selector: 'game-setting',
  template: `<mat-icon class="font24" svgIcon="settings" (click)="openSettingDialog()"></mat-icon>`,
})
export class GameSettingIconComponent {
    constructor(
        private dialog: MatDialog,
    ) {}

    // 현재 정보를 storage 에 저장하고
    // 게임모드로 변경한다.
    openSettingDialog(): void {
        this.dialog
        .open(GameSettingDialogComponent, {
            disableClose: true,
            width: '250px'
        })
        .afterClosed()
        .subscribe(() => {
        });
    }
}
