/**
* import { TimerService } from './services/timer.service';
* if (this.gameTimer) {this.gameTimer.refresh_nowDateTime(serverDateTime);}
*
* this.gameTimer = new TimerService({timeInterval: gameInterval});
* this.gameTimer.countdownStart(this.serverTime, (obj: any) => { // Object {next_no: 178, countdown_ii: 3, countdown_ss: 33}
            this.remainTime.remain = obj.remainsecond;
            this.remainTime.next = moment(obj.startTime).add(obj.remainsecond, 'seconds').format('HH:mm');
            // this.remainTime.next = moment(obj.startTime).add(obj.remainsecond + this.gameType * 60, 'seconds').format('HH:mm');
        });
*/
export class TimerService {

    private intervalId: any;
    private startTime: number = 0;
    private timeInterval = 60; // unit : second
    // private intervalId: any = '';

    constructor(params?: any) {
        if (params.timeInterval) {
            this.timeInterval = params.timeInterval;
        }
    }

    public stopTimer = () => {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    };

    /**
     * @param DateTime nowDateTime  2018-08-29T01:44:36.839Z
     */
    public refresh_nowDateTime = (nowDateTime: string) => {
        this.startTime = new Date(Date.parse(nowDateTime)).getTime(); // UnixTime으로 변경
    };

    public settimeInterval = (interval: number) => {
        this.timeInterval = interval;
    };


    public countdownStart = (nowDateTime: string, callback: (body: any) => void) => {

        const setNowDateTime = (newDateTime: string) => { // 현재 시간을 세팅한다. 서버 시간으로 세팅
            this.startTime = new Date(Date.parse(newDateTime)).getTime(); // UnixTime으로 변경
        };

        setNowDateTime(nowDateTime);

        const checkTime = (i: number | string) => {//
            if (i < 10) { i = '0' + i; }  // add zero in front of numbers < 10
            return i;

        };
        /**
         * new Date 는 모든 데이타를 로컬라이징 시킨다.
         * 따라서 현재 시간을 offset을 구하여 빼면 UTC 타임이 되고 이곳에서 한국시간을 더하면 한국 시간이 된다.
         */
        const localAsiaSeoul = (utime?: number) => {
            utime = utime ? utime : this.startTime;

            const LocalDateTime = new Date(utime); // .toLocaleString('en-US', {timeZone: 'UTC'});
            const userTimezoneOffset = LocalDateTime.getTimezoneOffset() * 60000;

            return new Date(LocalDateTime.getTime() + userTimezoneOffset + 32400000);
        };

        const countdownHumanreadable = () => {
            const obj: any = {};

            const startDateTime = localAsiaSeoul();

            obj.Y = startDateTime.getFullYear();
            obj.m = startDateTime.getMonth();
            obj.d = startDateTime.getDate();
            obj.H = startDateTime.getHours();
            obj.i = startDateTime.getMinutes();
            obj.s = startDateTime.getSeconds();

            obj.i = checkTime(obj.i);
            obj.s = checkTime(obj.s);
            obj.m = checkTime(obj.m + 1);

            const passSeconds = startDateTime.getTime() % (this.timeInterval * 1000);
            const countdownSeconds = Math.ceil((( this.timeInterval * 1000) - passSeconds) / 1000);
            obj.countdown_ii = Math.floor(countdownSeconds / 60);
            obj.countdown_ss = countdownSeconds % 60;
            return obj;
        };
/*
        const formatAMPM = (d: Date) => {
            const h = d.getHours();
            return (h < 12 ? '오전' : '오후') + ' '  + (h % 12 || 12)
                + ':' + ('0' + d.getMinutes().toString()).slice(-2);
        };
*/
        const formatYMDAMPM = (settedTime: number) => {
            const d = localAsiaSeoul(settedTime);
            const h = d.getHours();
            return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate() + ' ' + (h < 12 ? 'AM' : 'PM') + ' '  + (h % 12 || 12)
                + ':' + ('0' + d.getMinutes().toString()).slice(-2) + ':' + ('0' + d.getSeconds().toString()).slice(-2);
        };

        const displayTimer = () => {
            const obj = countdownHumanreadable();
            // 하단은 좌측 출력용
            obj.remainsecond = obj.countdown_ii * 60 + obj.countdown_ss;
        //    obj.next_no = getRound() + 1;

            // const localTime = formatAMPM(startTime); // 오전 3:32
            const localTime = formatYMDAMPM(this.startTime); // 2018.08.10 PM 6:31

            if (typeof callback !== 'undefined') { // 이후 되도록 callback을 이용하여 함수처리
                callback({
                    countdown_ii: obj.countdown_ii,
                    countdown_ss: obj.countdown_ss,
                    remainsecond: obj.remainsecond,
                    c_datetime: localTime,
                    startTime: this.startTime});
            }
        };

        this.intervalId = setInterval(() => {
            this.startTime = this.startTime + 1000; // 시간을 1초식 올린다.
            displayTimer();
        }, 1000);

    };
}
