// import { Plugins } from '@capacitor/core';
import {LocalNotifications} from '@capacitor/local-notifications';
// const { LocalNotifications } = Plugins;

// export interface LocalNotificationSchedule {
//     at?: Date;
//     repeats?: boolean;
//     every?: 'year' | 'month' | 'two-weeks' | 'week' | 'day' | 'hour' | 'minute' | 'second';
//     count?: number;
//     on?: {
//         year?: number;
//         month?: number;
//         day?: number;
//         hour?: number;
//         minute?: number;
//     };
// }


export class LocalNotificationService {
    constructor() {}

    /**
     * Initialize AdMob
     */
    public async schedule(notification: any): Promise<void> {
        LocalNotifications['schedule']({
          notifications: [
            notification
          ]
        });
    }

}

