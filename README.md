# GameMatch3

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