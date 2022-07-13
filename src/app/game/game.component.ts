import { Component, OnInit, AfterViewInit, HostListener, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import { EventService } from '../services/event.service';
import { ConfigService } from '../services/config.service';
import { AdMobService } from '../services/cap-admob.service';
import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import OrbitControls from '../controller/orbit.controls';
import { Haptics } from '@capacitor/haptics';
import { Howl } from 'howler';
import { Subject} from 'rxjs'; // , timer, Subject
import { takeUntil} from 'rxjs/operators';
// import OrbitControls from 'orbit-controls-es6';

// 게임 플로우
// 1. 접근시 게임레벨 선택 (현재 레벨을 기준으로 하고 최고치에서 하단으로만 선택가능)및 start
// 2. start 시 화면이 먼 거리에서 아래로 focus 되면서 focus가 끝나면 fadein 시킨다.
// 3.게임 종료시는 현재 레벨에서 자동 업데이트
// 4. full 맵은 액션은 안되고 맵만 작게 보여준다. (이때 랜덤 광고 노출)

import * as CANNON from 'cannon';
import { CannonDebugRenderer } from './debugger';
import { Maze } from './maze';

export type GameStatus = 'init' | 'ready' | 'play' | 'fadeIn' | 'fadeOut';

import { Storage } from '../services/storage.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './game.html',
  styleUrls: ['./game.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GameComponent implements OnInit, AfterViewInit {
    @ViewChild('domContainer', {static: true}) domContainer!: ElementRef<HTMLDivElement>;
    private ngUnsubscribe = new Subject();

    private sceneWidth!: number;
    private sceneHeight!: number;
    private gameStatus: GameStatus = 'init';

    private renderer!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private light!: THREE.PointLight;
    private endPointLight!: THREE.PointLight;
    private controls!: OrbitControls;


    // private material: THREE.MeshLambertMaterial;
    private ballMesh!: THREE.Mesh;
    private ballRadius = 0.25;
    private planeMesh!: THREE.Mesh;
    private blockMeshs: THREE.Mesh[] = [];
    private blockBodies: CANNON.Body[] = [];
    // from now for cannon
    private world: any;
    private ballBody!: CANNON.Body;
    private cannonDebugRenderer: any;


    private fullMode = false;
    private highLevel!: number;
    public level!: number; // 현재 레벨
    public pagingLevels: number[] = []; // 상단에 디스플레이될 레벨들
    private orbitControllerEnable = false;
    public showPagingLevels = false; //

    private storage: any;

    private sounds: any = {
        roll: {} as any,
        goal: {} as any,
        kick: {} as any,
        bgm: {} as any
    };

/*
    @HostListener('document:mousemove', ['$event'])
    mousemove(e: any) {
        this.mouse.x = ( e.clientX / this.sceneWidth ) * 2 - 1;
        this.mouse.y = - ( e.clientY / this.sceneHeight ) * 2 + 1;
    }
    */
    /*
    @HostListener('document:mousedown', ['$event'])
    mousedown(e: any) {
        this.mouse.x = ( e.clientX / this.sceneWidth ) * 2 - 1;
        this.mouse.y = - ( e.clientY / this.sceneHeight ) * 2 + 1;
    }
    */

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        // this.key = event.key;
        this.handleKeyDown(event);
    }

    @HostListener('window:resize')
    onResize() {
        this.onWindowResize();
    }

    constructor(
        private eventSvc: EventService,
        private configSvc: ConfigService,
        private admobService: AdMobService,
    ) {
        this.storage = new Storage();
    }
    ngOnInit() {

    }
    ngAfterViewInit() {
        const interval = setInterval(() => {
            const flag = this.domContainer.nativeElement.offsetHeight;
            if (flag) {
                clearInterval(interval);
                this.init();
            }
        }, 10);
    }
    private init() {
        this.eventSvc.subscribe()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((obj: any) => {
            if (obj.type === 'appStateChange' ) {
                if (obj.payload.status === 'pause') {
                    this.sounds.bgm.stop();
                } else {
                    this.playGameSound('bgm');
                    // this.sounds.bgm.play();
                }
            }
        });

        this.setSounds();
        this.configSvc.getBGMSound()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((bool: boolean) => {
            if (bool) {
                this.sounds.bgm.play();
            } else {
                this.sounds.bgm.stop();
            }
        });
        // this.sceneWidth = window.innerWidth;
        // this.sceneHeight  = window.innerHeight;
        this.sceneWidth = this.domContainer.nativeElement.offsetWidth;
        this.sceneHeight  = this.domContainer.nativeElement.offsetHeight;


        this.level = this.storage.level;
        this.highLevel = this.storage.highLevel;


        this.setRenderer();
        this.setScene();
        this.setCamera();
        this.setLight(); // Point Light
        if (this.orbitControllerEnable === true) {
            this.setOrbitController();
        }

        this.initCannon();

        // Add the ball.
        this.addBall();

        // Add the maze.
        this.createMaze();

        // Add the ground.
        this.createGround();

        this.actGameState('init');

        // this.mouse = new THREE.Vector2();
        // this.setAxesHelper();
        // this.setGridHelper();
        this.update();
    }
    private setSounds() {

        this.sounds.kick = new Howl({
            src: ['/assets/sounds/kick.ogg'],
            preload: true,
            onend: () => { // e
            },
            onloaderror: () => {
            },
        });

        this.sounds.goal = new Howl({
            src: ['/assets/sounds/explode.mp3'],
            preload: true,
            onend: () => { // e
            },
            onloaderror: () => {
            },
        });

        // this.sounds.roll = new Howl({
        //     src: ['/assets/sounds/roll.ogg'],
        //     preload: true,
        //     volume: 0.1,
        //     onend: () => { // e
        //     },
        //     onloaderror: () => {
        //     },
        // });

        // if (this.sounds.click) {
        //     this.sounds.click.autoSuspend = false;
        // }

        this.sounds.bgm = new Howl({
          src: ['/assets/sounds/bgm-for-fun.ogg'],
          preload: true,
          loop: true,
          volume: 0.1,
        });

        this.sounds.bgm.once('load', () => {
          this.playGameSound('bgm');
        });
    }

    private playGameSound(sound: string) {
        switch(sound) {
            case 'bgm':
                if (this.configSvc.bgmsound) {
                    this.sounds[sound].play();
                }
                break;
            default:
                if (this.configSvc.effectsound) {
                    this.sounds[sound].play();
                }
            break;
        }
    }

    private setRenderer() {
        this.renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer : true }); // renderer with transparent backdrop
        this.renderer.setSize( this.sceneWidth, this.sceneHeight );
        this.domContainer.nativeElement.appendChild(this.renderer.domElement);
        // renderer.shadowMapSoft = PlanetsInfo.config.shadows.softShadows;
    }

    private setScene() {
        this.scene = new THREE.Scene(); // the 3d scene
        // this.scene.fog = new THREE.FogExp2( 0x000000, 0.14 );
        this.scene.add( new THREE.AmbientLight( 0xAAAAAA ) );

    }

    // 카메라 관련 정의 시작
    private setCamera() {
        const fov = 60; // [Float]  Camera frustum vertical field of view, from bottom to top of view, in degrees. Default is 50.
        // const aspect = this.sceneWidth / this.sceneHeight;  // the canvas default
        const aspect = this.sceneWidth / this.sceneHeight;  // [Float] Camera frustum aspect ratio, usually the canvas width / canvas height. Default is 1 (square canvas).

        const near = 1; // [Float] Camera frustum near plane. Default is 0.1.
        const far = 1000; // [Float]  Camera frustum far plane. Default is 2000.
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(1, 1, 10);
    }

    private setLight() {
        this.light = new THREE.PointLight(0xffffff, 1);
        this.light.position.set(1, 1, 1.3);
        this.scene.add(this.light);
    }

    // 카메라 관련 정의 끝
    private addBall() {
        const ironTexture = new THREE.TextureLoader().load( '/assets/images/ball.png' );
        const g = new THREE.SphereGeometry(this.ballRadius, 32, 16);
        const m = new THREE.MeshPhongMaterial({map: ironTexture});
        this.ballMesh = new THREE.Mesh(g, m);
        this.ballMesh.position.set(0, 1, this.ballRadius);
        this.scene.add(this.ballMesh);

        // 3. 반경 및 질량값 생성(for ball)
        const mass = 1;
        const sphereShape = new CANNON.Sphere(this.ballRadius);
        this.ballBody = new CANNON.Body({ mass });
        // this.ballBody = new CANNON.RaycastVehicle({chassisBody});
        this.ballBody.addShape(sphereShape);
        // this.ballBody.position.set(1, 1, this.ballRadius);
        this.ballBody.position.set(0, 1, 1);
        this.ballBody.linearDamping = 0.4;
        // 속도 저하값 생성
        // this.ballBody.linearDamping = 0.9;
        this.world.add(this.ballBody);
    }

    private createMaze() {
        const maze = new Maze(this.level, this.level);
        // const mazeMesh =
        this.buildMazeMesh(maze.result);
    //    this.scene.add(mazeMesh);
    }

    private removeGround() {
        if (this.planeMesh) {
            this.planeMesh.geometry.dispose();
            // this.planeMesh.material.dispose();
            this.scene.remove( this.planeMesh );
        }
    }
    private createGround() {
        this.removeGround();
        const planeTexture = new THREE.TextureLoader().load( '/assets/images/concrete.png' );
        // PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
        const g = new THREE.PlaneGeometry(this.level * 2 + 1, this.level * 2 + 1, this.level, this.level);
        planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
        planeTexture.repeat.set(this.level * 5, this.level * 5);
        const m = new THREE.MeshPhongMaterial({map: planeTexture});
        this.planeMesh = new THREE.Mesh(g, m);
        this.planeMesh.position.set((this.level * 2) / 2, (this.level * 2) / 2, 0);
        this.planeMesh.rotation.set(0, 0, 0);
        this.scene.add(this.planeMesh);

        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        // groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.add(groundBody);
    }

    // https://github.com/schteppe/cannon.js/wiki/Hello-Cannon.js!
    private initCannon() {
        // Setup our world
        // 1. world 생성
        this.world = new CANNON.World();
        this.world.gravity.set(0, 0, -9.82); // m/s²
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;

        // this.cannonDebugRenderer = new CannonDebugRenderer( this.scene, this.world );
    }


    // private setGridHelper() {
    //     const helper = new THREE.GridHelper( 1000, 40, 0x303030, 0x303030 );
    //     helper.position.y = -75;
    //     this.scene.add( helper );
    // }

    private setOrbitController() {
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.005;
    //     this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = Infinity;
        // this.controls.maxPolarAngle = Math.PI / 2; //
        // this.controls.enableZoom = true;
        this.controls.zoomSpeed = 1.2;
    }

    // private setAxesHelper() {
    //     this.scene.add( new THREE.AxesHelper(200) );
    // }




    private render() {
        // const timer = 0.0001 * Date.now();
        const dt = 1 / 60;

        this.world.step(dt, 8, 3);
        const position = new THREE.Vector3(this.ballBody.position.x, this.ballBody.position.y, this.ballBody.position.z);
        this.ballMesh.position.copy(position);



        const quaternion = new THREE.Quaternion(this.ballBody.quaternion.x, this.ballBody.quaternion.y, this.ballBody.quaternion.z, this.ballBody.quaternion.w);
        // quaternion.setFromAxisAngle( new THREE.Vector3( this.ballBody.quaternion.x, this.ballBody.quaternion.y, this.ballBody.quaternion.z ), this.ballBody.quaternion.w);
        this.ballMesh.quaternion.copy(quaternion);
        // this.cannonDebugRenderer.update();

        // Update camera and light positions.
        // 아래처럼 카메라의 포지션을 설정하면 ballMesh를 천천히 따라가는 효과가 있음
        if (this.fullMode === true) {

        } else if (this.orbitControllerEnable === false) {
            this.camera.position.x += (this.ballMesh.position.x - this.camera.position.x) * 0.1;
            this.camera.position.y += (this.ballMesh.position.y - this.camera.position.y) * 0.1;
            this.camera.position.z += (5 - this.camera.position.z) * 0.05;
            this.light.position.x = this.camera.position.x;
            this.light.position.y = this.camera.position.y;
            this.light.position.z = this.camera.position.z - 3.7;

            // if (this.camera.position.z < 4.1) {
            //    this.camera.position.z = 4;
            // }
        }

        switch (this.gameStatus) {
            case 'fadeIn': // 점점 밝아진 후 플레이
                this.light.intensity += 0.1 * (1.0 - this.light.intensity);

                if (Math.abs(this.light.intensity - 1.0) < 0.05) {
                    this.light.intensity = 1.0;
                    this.actGameState('play');

                }
                break;
            case 'init':
            //    this.light.intensity += 0.1 * (0.0 - this.light.intensity);
                break;
            case 'fadeOut': // 어두워 진 후 새게임 생성

                this.light.intensity += 0.1 * (0.0 - this.light.intensity);
                if (Math.abs(this.light.intensity - 0.0) < 0.1) {
                    this.playGameSound('goal');
                    this.light.intensity = 0.0;
                    this.actGameState('ready');
                }
                break;
        }

        this.renderer.render( this.scene, this.camera );
    }

    private update = () => {
        this.render();
        requestAnimationFrame(this.update); // request next update
    }




    private removeMazeMesh() {
        this.blockMeshs.forEach( ( block: THREE.Mesh ) => {
            block.geometry.dispose();
            this.scene.remove( block );
        });

        this.scene.remove( this.endPointLight );

        this.blockBodies.forEach( ( block: CANNON.Body ) => {
            this.world.remove( block );
        });
    }
    private buildMazeMesh(field: any) {
        this.removeMazeMesh();
        const brickTexture = new THREE.TextureLoader().load( '/assets/images/brick.png' );
        // const dummy = new THREE.Geometry();
        const material = new THREE.MeshPhongMaterial({map: brickTexture});
        for (let i = 0; i < field.length; i++) {
           for (let j = 0; j < field.length; j++) {
               if (field[i][j]) {
                   // const geometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);
                    const geometry = new THREE.BoxGeometry(1, 1, 1);
                    const blockMesh = new THREE.Mesh(geometry, material);
                    blockMesh.position.x = i;
                    blockMesh.position.y = j;
                    blockMesh.position.z = 0.5;
                    this.blockMeshs.push(blockMesh);
                    this.scene.add(blockMesh);


                    // const boxShape = new CANNON.Box(new CANNON.Vec3(0.75, 0.75, 0.75));
                    const boxShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1 / 2, 1 / 2));
                    const boxBody = new CANNON.Body({ mass: 0 });
                    boxBody.addShape(boxShape);
                    boxBody.position.set(i, j, 0.5);
                    this.blockBodies.push(boxBody);
                    this.world.addBody(boxBody);

                    // const mazeMesh = new THREE.Mesh(geometry, material);

               }
           }
        }

        // 밖으로 나가지 못하게 투명 wall 설치
        // 시작점 투명 wall
        const startBoxShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1 / 2, 1 / 2));
        const startBoxBody = new CANNON.Body({ mass: 0 });
        startBoxBody.addShape(startBoxShape);
        startBoxBody.position.set(-1, 1, 0.5);
        this.world.addBody(startBoxBody);
        this.blockBodies.push(startBoxBody);

        // 끝점 투명 wall
        const endBoxShape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1 / 2, 1 / 2));
        const endBoxBody = new CANNON.Body({ mass: 0 });
        endBoxBody.addShape(endBoxShape);
        endBoxBody.position.set(this.level * 2 - 1, this.level * 2 + 1, 0.5);
        this.addEndPointLight(this.level * 2 - 1, this.level * 2 + 1, 1);
        this.world.addBody(endBoxBody);
        this.blockBodies.push(endBoxBody);

        // 마지막 박스에 도착했을 경우
        endBoxBody.addEventListener('collide', () => {
            this.actGameState('fadeOut');
            this.level++;

            this.storage.level = this.level;
            this.storage.highLevel = this.level;
            this.highLevel = this.storage.highLevel;
            this.updatePagingLevels();
            this.showInterstitial();

        });

    }

    private addEndPointLight( x: number, y: number, z: number ) {
        const textureLoader = new THREE.TextureLoader();
        const textureFlare = textureLoader.load( '/assets/images/lensflare.png' );
        this.endPointLight = new THREE.PointLight( 0xffffff, 10, 1 );

        this.endPointLight.color.setHSL( 0.08, 0.8, 0.5 );
        this.endPointLight.position.set( x, y, z );
        this.scene.add( this.endPointLight );
        const lensflare = new Lensflare();
        lensflare.addElement( new LensflareElement( textureFlare, 700, 0, this.endPointLight.color ) );
        this.endPointLight.add( lensflare );
    }


    // 브라우저 제어시
    private handleKeyDown(e: KeyboardEvent) {
        // Define some impulse to apply
        const rotationMatrix = new THREE.Matrix4();
        const thrustImpulse = 1;
        let forceVector!: THREE.Vector3;
        switch (e.key) {
            case 'ArrowUp':
                forceVector = new THREE.Vector3(0, thrustImpulse, 0).applyMatrix4(rotationMatrix);
            // this.ballBody.applyEngineForce(up ? 0 : -maxForce, 2);
            // vehicle.applyEngineForce(up ? 0 : -maxForce, 3);
                break;
            case 'ArrowDown':
                forceVector = new THREE.Vector3(0, -thrustImpulse, 0).applyMatrix4(rotationMatrix);
                break;
            case 'ArrowLeft':
                forceVector = new THREE.Vector3(-thrustImpulse, 0, 0).applyMatrix4(rotationMatrix);
                break;
            case 'ArrowRight':
                forceVector = new THREE.Vector3(thrustImpulse, 0, 0).applyMatrix4(rotationMatrix);
                break;
        }

        // Calculate the vector we'll use to apply the impulse in the object's positive Z direction

        if (forceVector) {
            // Convert the vector to a CANNON vector, otherwise it does nothing
            const cannonVector = new CANNON.Vec3(forceVector.x, forceVector.y, forceVector.z);

            // Apply the impulse at the center of the body
            this.ballBody.applyImpulse(cannonVector, this.ballBody.position);
        }
    }

    // 모바일 제어
    public setClick(e: MouseEvent) {
        if (this.fullMode === false) {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();

            //  This is the mouse clicks that do work
            mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
            raycaster.setFromCamera( mouse, this.camera );

            const thrustImpulse = 5;
            let forceVector: THREE.Vector3;
            // forceVector = raycaster.ray.direction.applyMatrix4(rotationMatrix
            forceVector = raycaster.ray.direction;
            if (forceVector) {
                // Convert the vector to a CANNON vector, otherwise it does nothing
                const cannonVector = new CANNON.Vec3(forceVector.x * thrustImpulse, forceVector.y * thrustImpulse, forceVector.z * thrustImpulse);

                // Apply the impulse at the center of the body
                this.playGameSound('kick');
                // this.playGameSound('roll');
                if (this.configSvc.vibration === true) {
                    Haptics.vibrate({duration: 20});
                }
                this.ballBody.applyImpulse(cannonVector, this.ballBody.position);
            }
            // var intersects = ray.intersectObjects( targetList, true );

        } else {
            this.fullMode = false;
        }
    }


    private actGameState(gameStatus: GameStatus) {
        this.gameStatus = gameStatus;
        switch (gameStatus) {
            case 'init':
                break;
            case 'ready':
                this.camera.position.set(1, 1, 5);
                this.light.position.set(1, 1, 1.3);
                this.light.intensity = 0.0;
                this.ballBody.position.set(0, 1, 1);
                this.createMaze();
                this.createGround();
                this.actGameState('fadeIn');
                break;
            case 'play':
                break;
            case 'fadeIn':
                break;
            case 'fadeOut':
                break;
        }
    }

    private onWindowResize() {
        this.sceneWidth = this.domContainer.nativeElement.offsetWidth;
        this.sceneHeight = this.domContainer.nativeElement.offsetHeight;
        this.renderer.setSize(this.sceneWidth, this.sceneHeight);
        this.camera.aspect = this.sceneWidth / this.sceneHeight;
        this.camera.updateProjectionMatrix();
    }

    private cameraPositinUpdate = () => {
        const mazeCenter = {x: this.level, y: this.level, z: 0};
        mazeCenter.z = this.level * 3 + 3; // 1: 6 , 2: 9, 3: 12, 4: 15
        this.camera.position.x += (mazeCenter.x - this.camera.position.x) * 0.1;
        this.camera.position.y += (mazeCenter.y - this.camera.position.y) * 0.1;
        this.camera.position.z += (mazeCenter.z - this.camera.position.z) * 0.1;
        if (this.fullMode === true) {
            requestAnimationFrame(this.cameraPositinUpdate); // request next update
        }
    }
    public full(bool: boolean) {
        this.fullMode = bool;
        if (bool) {
            // const rand = Math.floor((Math.random() * 3) + 1);
            // if (rand === 3 && Capacitor.isNativePlatform()) {
            //     this.admobService.showInterstitial(environment.admob.interstitial);
            // }
            // 중심 사이즈 계산
            this.cameraPositinUpdate();
        }
    }

    // level 이동 관련
    public expandLevels() {
        this.showPagingLevels = !this.showPagingLevels;
        this.updatePagingLevels();
    }

    private updatePagingLevels() {
        console.log('updatePagingLevels');
        this.pagingLevels = [];
        if (this.showPagingLevels) {
            let start = 0; //
            let end = 0;
            const overCnt = this.highLevel - this.level;

            if (overCnt > 3) {
                start = this.level;
                end = this.level + 2;

            } else {
                end = this.highLevel;
                start = end - 2;
                start = start < 1 ? 1 : start;
            }
            for (let i = start; i <= end  ; i++) {
                this.pagingLevels.push(i);
            }
        }
    }
    public gotoLevel(level: number) {
        this.showPagingLevels = false;
        this.level = level;
        this.actGameState('ready');
        this.showInterstitial();
    }

    /**
    *@param String flag prev | next
    */
    public levelSection(flag: string) {
        switch(flag) {
            case 'prev':
                if (this.pagingLevels[0] !== 1) {
                    this.pagingLevels.unshift(this.pagingLevels[0] - 1);
                    this.pagingLevels.pop();
                }
                break;
            case 'next':
                if (this.pagingLevels[this.pagingLevels.length -1] !== this.highLevel) {
                    this.pagingLevels.push(this.pagingLevels[this.pagingLevels.length -1] + 1);
                    this.pagingLevels.shift();
                }
                break;
        }
    }

    private showInterstitial() {
        const rand = Math.floor((Math.random() * 3) + 1);
        console.log(rand);
        if (rand === 3 && Capacitor.isNativePlatform()) {
            this.admobService.showInterstitial(environment.admob.interstitial);
        }
    }
}
