import { Injectable } from '@angular/core';
// import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

import {
    AdMob,
    BannerAdOptions,
    BannerAdSize,
    BannerAdPosition,
    BannerAdPluginEvents,
    AdMobBannerSize,
    InterstitialAdPluginEvents,
    AdLoadInfo,
    AdOptions,
    RewardAdPluginEvents,
    AdMobRewardItem,
    RewardAdOptions,
    AdMobError

} from '@capacitor-community/admob';

// https://github.com/capacitor-community/admob
@Injectable()
export class AdMobService {
    constructor() {
    }

    // sendMessage(obj: any) {
    //     this.subject.next(obj);
    // }
    //
    // getMessage(): Observable<any> {
    //     return this.subject.asObservable();
    // }

    /**
     * Initialize AdMob
     */
    public async initialize(): Promise<void> {
        const { status } = await AdMob.trackingAuthorizationStatus();

        if (status === 'notDetermined') {
        /**
         * If you want to explain TrackingAuthorization before showing the iOS dialog,
         * you can show the modal here.
         * ex)
         * const modal = await this.modalCtrl.create({
         *   component: RequestTrackingPage,
         * });
         * await modal.present();
         * await modal.onDidDismiss();  // Wait for close modal
         **/
        }

        AdMob.initialize({
            requestTrackingAuthorization: true,
            // testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
            // initializeForTesting: true,
        });
    }

    /**
     * Show Banner
     */
    public async BannerAdPluginEvents(callback:(result: any) => void): Promise<void> {
        AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
            callback({event: 'Loaded'});
        });

        AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
            callback({event: 'SizeChanged', size});
            // Subscribe user rewarded
        });

        AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error: AdMobError) => {
            callback({event: 'FailedToLoad', error});
            // console.log('BannerAdPluginEvents.FailedToLoad:', JSON.stringify(info));
            // callback({flag: 'FailedToLoad', size});
            // Subscribe user rewarded
        });

        // BannerAdPluginEvents.FailedToLoad
        // BannerAdPluginEvents.Opened
        // BannerAdPluginEvents.Closed
        // BannerAdPluginEvents.AdImpression
    }

    public async showBanner(adId: string) {
        const options: BannerAdOptions = {
            adId: adId,
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            // isTesting: true
            // npa: true
        };

        // console.log('show-banner start:', JSON.stringify(options))
        AdMob.showBanner(options);
    }


    /**
     * Show Interstitial
     */
     public async InterstitialAdPluginEvents(callback:(result: any) => void): Promise<void> {
        AdMob.addListener(InterstitialAdPluginEvents.Loaded, (info: AdLoadInfo) => {
            callback( {event: 'Loaded', info});
        });

        AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (info: AdMobError) => {
            callback({event: 'FailedToLoad', info});
        });

        AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
            callback({event: 'Showed'});
        });

        AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, (error: AdMobError) => {
            callback({event: 'FailedToShow', error});
        });

        AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
            callback({event: 'Dismissed'});
             // Subscribe user rewarded
        });
     }

    public async showInterstitial(adId: string) {
        const options: AdOptions = {
            adId: adId,
            // isTesting: true
            // npa: true
        };
        // console.log('showInterstitial: ', JSON.stringify(options));
        await AdMob.prepareInterstitial(options);
        await AdMob.showInterstitial();
    }


    /**
     * Show RewardVideo
     */
    /**
     * RewardAdPluginEvents 은 construct에 제공한다.
     */
    public async RewardAdPluginEvents(callback:(result: any) => void): Promise<void> {
        AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
            callback(info);
        });

        AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem: AdMobRewardItem) => {
            callback(rewardItem);
        });

        // RewardAdPluginEvents.FailedToLoad
        // RewardAdPluginEvents.Showed
        // RewardAdPluginEvents.FailedToShow
        // RewardAdPluginEvents.Dismissed
    }

    public async showRewardVideo(adId: string) {
        const options: RewardAdOptions = {
            adId: adId,
            // adSize: {},
            // type: 'DereaseErr',
            // amount: 1,
            // isTesting: true
            // npa: true
            // rewardItem: {},
            // rewardItem: {},
            ssv: {
                userId: 'userId',
                customData: JSON.stringify({reward_item: 'aaa' })
            },
            // rewardItem : {}
        };
        await AdMob.prepareRewardVideoAd(options);
        const rewardItem = await AdMob.showRewardVideoAd();
    }
}

