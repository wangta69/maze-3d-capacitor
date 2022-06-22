import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ConfigService {

    private soundSubject = new Subject<any>();
    private vibrationSubject = new Subject<any>();
    private languageSubject = new Subject<any>();
    private templateSubject = new Subject<any>();
    private config: any;
    private storageName = 'game.match3.config';

    constructor()
    {
        const config = localStorage.getItem(this.storageName);
        if(config) {
            this.config = JSON.parse(config);
        } else {
            this.resetConfig();
        }
    }

    /**
     * 초기 로딩시 game config 유무를 확인 후 없으면 default로 세팅해 준다.
     */
    private resetConfig(): void {
        // const gameConfig = JSON.parse(localStorage.getItem('config'))
        this.config = {
            sound: true,
            vibration: true,
            language: 'en',
            template: 'type2'
        }
        this.store();
    }

    private store(): void {
        localStorage.setItem(this.storageName, JSON.stringify(this.config));
    }

    public clear() {
        localStorage.setItem(this.storageName, '');
        this.resetConfig();
    }

    set vibration(bool: boolean) {
        this.config.vibration = bool;
        this.store();
    }

    get vibration(): boolean {
        return this.config.vibration;
    }

    set template(v: string) {
        this.config.template = v;
        this.store();
    }

    get template(): string {
        return this.config.template;
    }

    set sound(bool: boolean) {
        this.config.sound = bool;
        this.store();
    }

    get sound(): boolean {
        return this.config.sound;
    }



    get language(): string {
        return this.config.language;
    }

    set language(lan: string) {
        this.config.language = lan;
        this.store();
    }


    /**
     * 게임 사운드 변경용
     * @params Object obj {gameSound: bool}
     */
    setSound(bool: boolean): void {
        this.sound = bool;
        this.soundSubject.next(bool);
    }
    getSound(): Observable<boolean> {
        return this.soundSubject.asObservable();
    }

    /**
     * 게임 진동 변경용
     * @params Object obj {gameSound: bool}
     */
    setVibration(bool: boolean) {
        this.vibration = bool;
        this.store();
        this.vibrationSubject.next(bool);
    }

    getVibration(): Observable<boolean> {
        return this.vibrationSubject.asObservable();
    }

    /**
     * 언어설정 변경용
     * @params Object obj {gameSound: bool}
     */
    setLanguage(lan: string) {
        this.language = lan;
        this.languageSubject.next(lan);
    }
    getLanguage(): Observable<string> {
        return this.languageSubject.asObservable();
    }

    setTemplate(lan: string) {
        this.template = lan;
        this.templateSubject.next(lan);
    }
    getTemplate(): Observable<string> {
        return this.templateSubject.asObservable();
    }





    // /**
    //  * 게임 환경을 초기화 시킨다.
    //  */
    // private gameConfig(): void {
    //     let memoryGame = localStorage.getItem('memoryGame');
    //     if (!memoryGame) {
    //         const config = {highestScore: 0, level: 1, cardSet: 1};
    //         localStorage.setItem('memoryGame', JSON.stringify(config));
    //     }
    // }




    /*
    * How todo
    * 1. Add EventService to AppModule
    * import { EventService } from './services/event.service';
    * @NgModule({
    *  providers: [ EventService],
    * })
    *
    * 2. Add EventService to a Component where you are going to use
    * import { EventService } from './services/event.service';
    * constructor(protected eventSvc: EventService) {}
    *
    * 3. Send Message
    * message send : this.eventSvc.sendMessage({state: 'PROGRESS'});
    *
    * 4. Receive Message
    * message receive : this.eventSvc.getMessage().subscribe(message => { console.log(message) });
    */
}
