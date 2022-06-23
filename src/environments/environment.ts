// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appId: 'game.pondol.maze.app',
  appName: 'Brain 3D Maze',
  apiServer: 'https://game-1acce.firebaseapp.com',
  appVersion: 1.0,
  admob: {
      interstitial: 'ca-app-pub-1391539766228126/2773829810',
      rewardvideo: 'ca-app-pub-1391539766228126/7834584807',
      banner: 'ca-app-pub-1391539766228126/5884236556'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
