import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'game.pondol.maze.app',
  appName: 'Brain 3D Maze Puzzle',
  webDir: 'dist/maze3d',
  bundledWebRuntime: false,
  plugins: {
   SplashScreen: {
     launchShowDuration: 3000,
     launchAutoHide: true,
     backgroundColor: "#ffffffff",
     androidSplashResourceName: "splash",
     androidScaleType: "CENTER_CROP",
     showSpinner: true,
     androidSpinnerStyle: "large",
     iosSpinnerStyle: "small",
     spinnerColor: "#999999",
     splashFullScreen: true,
     splashImmersive: true,
     layoutName: "launch_screen",
     useDialog: true,
   },
   LocalNotifications: {
    // smallIcon: "assets/icon/favicon",
    // smallIcon: "ic_stat_icon_config_sample",
    smallIcon: "ic_stat_icon",
    iconColor: "#488AFF",
    sound: "beep.wav",
  },
 },
 // server: {
 //      url: 'http://192.168.0.21:4200',
 //      cleartext: true
 //  }
};

export default config;
