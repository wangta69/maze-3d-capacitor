import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable()
export class ConfigService {

    private soundSubject = new Subject<any>();
    private bgmSoundSubject = new Subject<any>();
    private effectSoundSubject = new Subject<any>();
    private vibrationSubject = new Subject<any>();
    private languageSubject = new Subject<any>();
    private config: any;
    private storageName = 'game.maze3d.config';

    constructor()
    {
        const config = localStorage.getItem(this.storageName);
        (window as any).config$ = new BehaviorSubject<any>(null); // 초기 화면이 완료되면
        if(config) {
            this.config = JSON.parse(config);

            (window as any).config$.next(this.config);
            if (typeof this.config.bgmsound === 'undefined') { // 버젼별 차이
                this.resetConfig();
            }
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
            bgmsound: true,
            effectsound: true,
            vibration: true,
            language: 'en'
        };
        this.store();
    }

    private store(): void {
        (window as any).config$.next(this.config);
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

    set sound(bool: boolean) {
        this.config.sound = bool;
        this.store();
    }

    get sound(): boolean {
        return this.config.sound;
    }

    set bgmsound(bool: boolean) {
        this.config.bgmsound = bool;
        this.store();
    }

    get bgmsound(): boolean {
        return this.config.bgmsound;
    }

    set effectsound(bool: boolean) {
        this.config.effectsound = bool;
        this.store();
    }

    get effectsound(): boolean {
        return this.config.effectsound;
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

    setBGMSound(bool: boolean): void {
        this.bgmsound = bool;
        this.bgmSoundSubject.next(bool);
    }
    getBGMSound(): Observable<boolean> {
        return this.bgmSoundSubject.asObservable();
    }

    setEffectSound(bool: boolean): void {
        this.effectsound = bool;
        this.effectSoundSubject.next(bool);
    }
    getEffectSound(): Observable<boolean> {
        return this.effectSoundSubject.asObservable();
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
