# Maze 3d (capacior 버젼)
cannon + threeJs 사용

cannon : 물리적
threejs는 이미지 구성


광고정책 : 기존 full map 에서는 광고 제거
레벨을 올리거나 특정레벨을 선택시 랜덤으로 광고 처리

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.2.

## Build
```
ng build
```
## Copy
```
npx cap copy
```

## Android Studio open

```
npx cap open android
```

## 버젼업 (Android)
버젼업을 할경우 반드시 build.gradle의 versionCode 와 versionName을 수정하여야한다. 특히 버젼코드는 기존 버젼보다 반드시 높은 것을 사용한다.
```
android > app > build.gradle
versionCode 1   <= 유저에게는 보여지지 않음, 정수로 계속 올려야 함
versionName "1.0" <= 유저에게 보여짐
```


### Build >> Create Signed Bundle / APK > Android App Bundle

*.aab 파일 업로드


flag 아이콘 : https://iconarchive.com/show/square-flags-icons-by-hopstarter.html  이것을 확용해도 더 좋을 듯

# 초기설치
github 에서 다운 받은 후 아래와 같이 처리한다.
```
ng build

npx cap add android
cordova-res android --skip-config --copy
npx cap sync
```
언어셑 추가
copy 아이콘어어 to [android/app/src/main/res]
admob 환경설정
```
npx cap open android

```
https://github.com/wangta69/angular-capacitor/blob/main/package-admob.md