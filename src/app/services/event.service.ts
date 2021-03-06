import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Message } from '../interface';
@Injectable()
export class EventService {
    private handler = new Subject<Message>();
    private subject = new Subject<any>();
    private ev = new Subject<any>();
    /**
     * @param Object obj {key, value}
     * key : platform, value : pause: 플레폼 background, resume: 플렛폼 result
     * key : game, value : pause:게임중지, resume:게임재개, start:게임시작, created: 게임생성, finished: 게임완료;
     */

    // this.eventSvc.broadcast('platform', {status: 'resume'});
    broadcast(type: string, payload: any) {
        this.handler.next({ type, payload });
    }

    subscribe(): Observable<Message> {
         return this.handler.asObservable();
     }

    sendMessage(obj: any) {``
        this.subject.next(obj);
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    sendGameEvent(obj: any) {
        this.ev.next(obj);
    }

    getGameEvent(): Observable<any> {
        return this.ev.asObservable();
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
    * message receive : this.eventSvc.getMessage().subscribe(message => { console.log(message); });
    */
    /*
    broadcast / subscribe 도 동일하나  filter 등을 이용하여 좀 더 구체적이 제어를 한다.
    this.eventSvc.subscribe()
    .pipe(takeUntil(this.ngUnsubscribe))
    .pipe(filter((message: Message) => message.type === 'touched'))
    .pipe(map(message => message.payload))
    .subscribe(() => { // payload: any
        this.vibration.vibrate(100);
    });
    */
}
