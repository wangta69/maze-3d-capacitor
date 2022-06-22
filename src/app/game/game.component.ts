import { Component, ViewChild, ViewEncapsulation, ElementRef, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
// https://rembound.com/articles/bubble-shooter-game-tutorial-with-html5-and-javascript#demo
// https://rembound.com/articles/how-to-make-a-match3-game-with-html5-canvas
import { Howl } from 'howler';
import { Storage } from '../services/storage.service';
import { ConfigService } from '../services/config.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: 'game.page.html',
  styleUrls: ['game.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GameComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('gameCanvas', {static: true}) gameCanvas: ElementRef<HTMLCanvasElement> = {} as ElementRef;
    // @HostListener('window:resize', ['$event'])
    // onResize(event: any) {
    //     console.log(event);
    //   event.target.innerWidth;
    // }

    // Get the canvas and context
    // private canvas = document.getElementById('viewport');
    private canvas: any;
    private context: any;

    // Timing and frames per second
    private lastframe = 0;
    private fpstime = 0;
    private framecount = 0;
    private fps = 0;
    private storage: Storage;

    // Mouse dragging
    private drag = false;

    // Level object
    private level: any = {
        x: 0,
        y: 0,
        columns: 8,     // Number of tile columns
        rows: 8,        // Number of tile rows
        tilewidth: 40,  // Visual width of a tile
        tileheight: 40, // Visual height of a tile
        tiles: [[]],      // The two-dimensional tile array
        selectedtile: { selected: false, column: 0, row: 0 }
    };

    // All of the different tile colors in RGB
    private tilecolors = [
        [255, 128, 128],
        [128, 255, 128],
        [128, 128, 255],
        [255, 255, 128],
        [255, 128, 255],
        [128, 255, 255],
        [255, 255, 255]
    ];

    private tileimages: any = [];
    // Clusters and moves that were found
    private clusters: any = [];  // { column, row, length, horizontal }
    private moves: any = [];     // { column1, row1, column2, row2 }
    // Current move
    private currentmove = { column1: 0, row1: 0, column2: 0, row2: 0 };
    // Game states
    private gamestates = { init: 0, ready: 1, resolve: 2 };
    private gamestate = this.gamestates.init;

    // Score
    public maxScore = 0;
    public score = 0;

    // Animation variables
    private animationstate = 0;
    private animationtime = 0;
    private animationtimetotal = 0.3;

    // Show available moves
    public showmoves = false;

    // The AI bot
    public aibot = false;

    // Game Over
    private gameover = false;

    private soundsEnable = false; // new 게임시 sounds 가 울리는 것을 회피
    private sounds: any = {
        explode: null,
    };

    private mode: any = {
        type1: {
            filepath: 'tiles',
            fileext: 'png',
            bgcolor: '#000000'
        },
        type2: {
            filepath: 'tiles2',
            fileext: 'jpg',
            bgcolor: '#242424'
        }
    }
    private template = 'type2';
    private ngUnsubscribe = new Subject();
    constructor(
        private configSvc: ConfigService,
    ) {
        this.storage = new Storage();
        this.maxScore = this.storage.maxScore;
        this.template = this.configSvc.template;

        this.sounds['explode'] = new Howl({
          src: ['/assets/sounds/explode.mp3'],
          preload: true,
        });

        this.loadImages();
    }

    ngOnInit() {
        this.configSvc.getTemplate()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((template) => {
            this.template = template;
            this.loadImages();
        });
    }

    ngAfterViewInit() {
        this.init();
    }

    ngOnDestroy() {
    }

    init() {

        // Get the grid position
        // Add mouse events
        this.canvas = this.gameCanvas.nativeElement;
        this.context = this.canvas.getContext('2d');

        this.resizeCanvas();
        // const canvasWidth = window.innerWidth;
        // const canvasHeight = window.innerHeight;
        // const canvasSize = canvasWidth > canvasHeight ? canvasHeight : canvasWidth;
        // this.level.tilewidth = Math.floor((canvasSize - 30) / this.level.columns); // 마진을 10 준다.
        // this.level.tileheight = this.level.tilewidth;
        //
        // this.level.x = (canvasSize - (this.level.tilewidth * this.level.columns)) / 2;
        // this.canvas.width = canvasSize;
        // this.canvas.height = canvasSize;


        // Initialize the two-dimensional tile array
        for (let i=0; i< this.level.columns; i++) {
            this.level.tiles[i] = [];
            for (let j = 0; j < this.level.rows; j++) {
                // Define a tile type and a shift parameter for animation
                this.level.tiles[i][j] = { type: 0, shift:0 }
            }
        }
    }

    private resizeCanvas() {
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;
        const canvasSize = canvasWidth > canvasHeight ? canvasHeight : canvasWidth;
        this.level.tilewidth = Math.floor((canvasSize - 30) / this.level.columns); // 마진을 10 준다.
        this.level.tileheight = this.level.tilewidth;

        this.level.x = (canvasSize - (this.level.tilewidth * this.level.columns)) / 2;
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
    }

    private start() {
        // New game
        this.newGame();
        this.main(0);
    }

    private async loadImages() {
        const titles = 7;
        let  loadcnt = 0;
        for(let i = 0; i < titles; i++) {
            // const filepath = '/assets/images/tiles/' + i +'.png';
            const filepath = '/assets/images/' + this.mode[this.template].filepath + '/' + i +'.' + this.mode[this.template].fileext;
            this.tileimages[i] = new Image();
            this.tileimages[i].src = filepath;
            this.tileimages[i].onload = () => {
                // this.drawImage();
                loadcnt ++;
                if (titles === loadcnt) {
                    this.start();
                }

            };
        }

    }
    // Main loop
    private main(tframe: number) {
        // Request animation frames
        window.requestAnimationFrame(this.main.bind(this));
        // window.requestAnimationFrame((tframe) => this.main);
        // Update and render the game
        this.update(tframe); // 변화할 좌표 계산
        this.render(); // 실제로 그리기
    }

    // Update the game state
    private update(tframe: number) {
        const dt = (tframe - this.lastframe) / 1000;
        this.lastframe = tframe;

        // Update the fps counter
        this.updateFps(dt);

        if (this.gamestate == this.gamestates.ready) {
            // Game is ready for player input

            // Check for game over
            if (this.moves.length <= 0) {
                this.gameover = true;
            }

            // Let the AI bot make a move, if enabled
            if (this.aibot) {
                this.animationtime += dt;
                if (this.animationtime > this.animationtimetotal) {
                    // Check if there are moves available
                    this.findMoves();

                    if (this.moves.length > 0) {
                         // Get a random valid move
                        const move: any = this.moves[Math.floor(Math.random() * this.moves.length)];

                        // Simulate a player using the mouse to swap two tiles
                        this.mouseSwap(move.column1, move.row1, move.column2, move.row2);
                    } else {
                         // No moves left, Game Over. We could start a new game.
                         // newGame();
                    }
                    this.animationtime = 0;
                 }
             }
         } else if (this.gamestate == this.gamestates.resolve) {
            // Game is busy resolving and animating clusters
            this.animationtime += dt;

            if (this.animationstate == 0) {
                // Clusters need to be found and removed
                if (this.animationtime > this.animationtimetotal) {
                    // Find clusters
                    this.findClusters();

                    if (this.clusters.length > 0) {
                        // Add points to the score
                        for (let i = 0; i < this.clusters.length; i++) {
                            // Add extra points for longer clusters
                            this.score += 100 * (this.clusters[i].length - 2);;
                        }

                        // max score를 업데이트 한다.
                        this.storage.maxScore = this.score;
                        this.maxScore = this.storage.maxScore;

                        this.playSound('explode');
                        // Clusters found, remove them
                        this.removeClusters();

                        // Tiles need to be shifted
                        this.animationstate = 1;
                    } else {
                        // No clusters found, animation complete
                        this.gamestate = this.gamestates.ready;
                    }
                    this.animationtime = 0;
                }
            } else if (this.animationstate == 1) {
                // Tiles need to be shifted
                if (this.animationtime > this.animationtimetotal) {
                    // Shift tiles
                    this.shiftTiles();

                    // New clusters need to be found
                    this.animationstate = 0;
                    this.animationtime = 0;

                    // Check if there are new clusters
                    this.findClusters();
                    if (this.clusters.length <= 0) {
                        // Animation complete
                        this.gamestate = this.gamestates.ready;
                    }
                }
            } else if (this.animationstate == 2) {
                // Swapping tiles animation
                if (this.animationtime > this.animationtimetotal) {
                    // Swap the tiles
                    this.swap(this.currentmove.column1, this.currentmove.row1, this.currentmove.column2, this.currentmove.row2);

                    // Check if the swap made a cluster
                    this.findClusters();
                    if (this.clusters.length > 0) {
                        // Valid swap, found one or more clusters
                        // Prepare animation states
                        this.animationstate = 0;
                        this.animationtime = 0;
                        this.gamestate = this.gamestates.resolve;
                    } else {
                        // Invalid swap, Rewind swapping animation
                        this.animationstate = 3;
                        this.animationtime = 0;
                    }

                    // Update moves and clusters
                    this.findMoves();
                    this.findClusters();
                }
            } else if (this.animationstate == 3) {
                // Rewind swapping animation
                if (this.animationtime > this.animationtimetotal) {
                    // Invalid swap, swap back
                    this.swap(this.currentmove.column1, this.currentmove.row1, this.currentmove.column2, this.currentmove.row2);

                    // Animation complete
                    this.gamestate = this.gamestates.ready;
                 }
             }

            // Update moves and clusters
            this.findMoves();
            this.findClusters();
        }
    }

    private updateFps(dt: number) {

        if (this.fpstime > 0.25) {
            // Calculate fps
            // this.fps = Math.round(this.framecount / this.fpstime);
            Math.round(this.framecount / this.fpstime);
            // console.log(this.fps);

            // Reset time and framecount
            this.fpstime = 0;
            this.framecount = 0;
        }

        // Increase time and framecount
        this.fpstime += dt;
        this.framecount++;
    }

    // Draw text that is centered
    private drawCenterText(text: string, x: number, y: number, width: number) {
        const textdim = this.context.measureText(text);
        this.context.fillText(text, x + (width-textdim.width) / 2, y);
    }

     // Render the game
    private render() {
        // Draw level background
        const levelwidth = this.level.columns * this.level.tilewidth;
        const levelheight = this.level.rows * this.level.tileheight;
        this.context.fillStyle = this.mode[this.template].bgcolor;
        this.context.fillRect(this.level.x - 4, this.level.y - 4, levelwidth + 8, levelheight + 8);

        // Render tiles
        this.renderTiles();

        // Render clusters
        this.renderClusters();

        // Render moves, when there are no clusters
        if (this.showmoves && this.clusters.length <= 0 && this.gamestate == this.gamestates.ready) {
            this.renderMoves();
        }

        // Game Over overlay
        if (this.gameover) {
            this.context.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.context.fillRect(this.level.x, this.level.y, levelwidth, levelheight);

            this.context.fillStyle = '#ffffff';
            this.context.font = '24px Verdana';
            this.drawCenterText('Game Over!', this.level.x, this.level.y + levelheight / 2 + 10, levelwidth);
        }
    }

    // Render tiles
    private renderTiles() {
        for (let i = 0; i < this.level.columns; i++) {
            for (let j = 0; j < this.level.rows; j++) {
                // Get the shift of the tile for animation
                const shift = this.level.tiles[i][j].shift;

                // Calculate the tile coordinates
                const coord = this.getTileCoordinate(i, j, 0, (this.animationtime / this.animationtimetotal) * shift);

                // Check if there is a tile present
                if (this.level.tiles[i][j].type >= 0) {
                    // Get the color of the tile
                    // const col = this.tilecolors[this.level.tiles[i][j].type];
                    // console.log('renderTiles >> col >>', col, this.level.tiles[i][j].type);

                    // Draw the tile using the color
                    // this.drawTile(coord.tilex, coord.tiley, col[0], col[1], col[2]);
                    this.drawButtonTile(coord.tilex, coord.tiley, this.level.tiles[i][j].type);
                }

                // Draw the selected tile
                // 버튼이 드레그가 아니라 select 이면 현재 타일의 색상을 red로 바꾼다
                if (this.level.selectedtile.selected) {
                    if (this.level.selectedtile.column == i && this.level.selectedtile.row == j) {
                        // Draw a red tile
                        // this.drawTile(coord.tilex, coord.tiley, 255, 0, 0);
                    }
                }
            }
        }

        // Render the swap animation
        if (this.gamestate === this.gamestates.resolve && (this.animationstate === 2 || this.animationstate === 3)) {
            // Calculate the x and y shift
            const shiftx = this.currentmove.column2 - this.currentmove.column1;
            const shifty = this.currentmove.row2 - this.currentmove.row1;

            // First tile
            const coord1 = this.getTileCoordinate(this.currentmove.column1, this.currentmove.row1, 0, 0);
            const coord1shift = this.getTileCoordinate(this.currentmove.column1, this.currentmove.row1, (this.animationtime / this.animationtimetotal) * shiftx, (this.animationtime / this.animationtimetotal) * shifty);
            // const col1 = this.tilecolors[this.level.tiles[this.currentmove.column1][this.currentmove.row1].type];

            // Second tile
            const coord2 = this.getTileCoordinate(this.currentmove.column2, this.currentmove.row2, 0, 0);
            const coord2shift = this.getTileCoordinate(this.currentmove.column2, this.currentmove.row2, (this.animationtime / this.animationtimetotal) * -shiftx, (this.animationtime / this.animationtimetotal) * -shifty);
            // const col2 = this.tilecolors[this.level.tiles[this.currentmove.column2][this.currentmove.row2].type];

            // Draw a black background
            this.drawTile(coord1.tilex, coord1.tiley, 0, 0, 0);
            this.drawTile(coord2.tilex, coord2.tiley, 0, 0, 0);

            // Change the order, depending on the animation state
            if (this.animationstate == 2) {
                // Draw the tiles
                // this.drawTile(coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
                // this.drawTile(coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
                this.drawButtonTile(coord1shift.tilex, coord1shift.tiley, this.level.tiles[this.currentmove.column1][this.currentmove.row1].type);
                this.drawButtonTile(coord2shift.tilex, coord2shift.tiley, this.level.tiles[this.currentmove.column2][this.currentmove.row2].type);
            } else {
                // Draw the tiles
                // this.drawTile(coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
                // this.drawTile(coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
                this.drawButtonTile(coord2shift.tilex, coord2shift.tiley, this.level.tiles[this.currentmove.column2][this.currentmove.row2].type);
                this.drawButtonTile(coord1shift.tilex, coord1shift.tiley, this.level.tiles[this.currentmove.column1][this.currentmove.row1].type);

            }
        }
    }

    // Get the tile coordinate
    private getTileCoordinate(column: number, row: number, columnoffset: number, rowoffset: number) {
        const tilex = this.level.x + (column + columnoffset) * this.level.tilewidth;
        const tiley = this.level.y + (row + rowoffset) * this.level.tileheight;
        return { tilex: tilex, tiley: tiley};
    }

    // Draw a tile with a color
    private drawTile(x: number, y: number, r: number, g: number, b: number) {
        this.context.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        this.context.fillRect(x + 2, y + 2, this.level.tilewidth - 4, this.level.tileheight - 4);
    }

    private drawButtonTile(x: number, y: number, type: number) {
        // this.context.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        // this.context.fillRect(x + 2, y + 2, this.level.tilewidth - 4, this.level.tileheight - 4);
        const title = this.tileimages[type];
        this.context.drawImage(title, 0, 0, title.width, title.height, x + 2,  y + 2, this.level.tilewidth - 4, this.level.tileheight - 4);
    }

    // Render clusters
    private renderClusters() {
        for (let i=0; i < this.clusters.length; i++) {
            // Calculate the tile coordinates
            const coord = this.getTileCoordinate(this.clusters[i].column, this.clusters[i].row, 0, 0);

            if (this.clusters[i].horizontal) {
                // Draw a horizontal line
                this.context.fillStyle = '#00ff00';
                this.context.fillRect(coord.tilex + this.level.tilewidth/2, coord.tiley + this.level.tileheight/2 - 4, (this.clusters[i].length - 1) * this.level.tilewidth, 8);
            } else {
                // Draw a vertical line
                this.context.fillStyle = '#0000ff';
                this.context.fillRect(coord.tilex + this.level.tilewidth/2 - 4, coord.tiley + this.level.tileheight/2, 8, (this.clusters[i].length - 1) * this.level.tileheight);
            }
        }
    }

    // Render moves
    private renderMoves() {
        for (let i = 0; i < this.moves.length; i++) {
            // Calculate coordinates of tile 1 and 2
            const coord1 = this.getTileCoordinate(this.moves[i].column1, this.moves[i].row1, 0, 0);
            const coord2 = this.getTileCoordinate(this.moves[i].column2, this.moves[i].row2, 0, 0);

            // Draw a line from tile 1 to tile 2
            this.context.strokeStyle = '#ff0000';
            this.context.beginPath();
            this.context.moveTo(coord1.tilex + this.level.tilewidth/2, coord1.tiley + this.level.tileheight/2);
            this.context.lineTo(coord2.tilex + this.level.tilewidth/2, coord2.tiley + this.level.tileheight/2);
            this.context.stroke();
         }
     }

    // Start a new game
    private newGame() {
        this.soundsEnable = false;
        // Reset score
        this.score = 0;

        // Set the gamestate to ready
        this.gamestate = this.gamestates.ready;

        // Reset game over
        this.gameover = false;

        // Create the level
        this.createLevel();

        // Find initial clusters and moves
        this.findMoves();
        this.findClusters();

        this.soundsEnable = true;
     }

    // Create a random level
    private createLevel() {
        let done = false;

        // Keep generating levels until it is correct
        while (!done) {

            // Create a level with random tiles
            for (let i = 0; i < this.level.columns; i++) {
                for (let j = 0; j < this.level.rows; j++) {
                    this.level.tiles[i][j].type = this.getRandomTile();
                }
            }

            // Resolve the clusters
            this.resolveClusters();

            // Check if there are valid moves
            this.findMoves();

            // Done when there is a valid move
            if (this.moves.length > 0) {
                done = true;
            }
        }
    }

    // Get a random tile
    private getRandomTile() {
        return Math.floor(Math.random() * this.tilecolors.length);
    }

    // Remove clusters and insert tiles
    private resolveClusters() {
        // Check for clusters
        this.findClusters();
        // While there are clusters left
        while (this.clusters.length > 0) {

            // Remove clusters
            this.removeClusters();

            // Shift tiles
            this.shiftTiles();

            // Check if there are clusters left
            this.findClusters();
        }
    }


    /**
     * Find clusters in the level
     * 매치되는 블록이 있으면 this.clusters 에 넣어 둔다.
     */
    private findClusters() {
        // Reset clusters
        this.clusters = []

        // Find horizontal clusters
        for (let j = 0;  j < this.level.rows; j++) {
            // Start with a single tile, cluster of 1
            let matchlength = 1;
            for (let i=0; i < this.level.columns; i++) {
                let checkcluster = false;

                if (i == this.level.columns-1) {
                    // Last tile
                    checkcluster = true;
                } else {
                    // Check the type of the next tile
                    if (this.level.tiles[i][j].type == this.level.tiles[i+1][j].type &&
                        this.level.tiles[i][j].type != -1) {
                        // Same type as the previous tile, increase matchlength
                        matchlength += 1;
                    } else {
                        // Different type
                        checkcluster = true;
                    }
                }

                // Check if there was a cluster
                if (checkcluster) {
                    if (matchlength >= 3) {
                        // Found a horizontal cluster
                        this.clusters.push({ column: i+1-matchlength, row:j,
                                        length: matchlength, horizontal: true });
                    }

                    matchlength = 1;
                }
            }
        }

        // Find vertical clusters
        for (let i = 0; i < this.level.columns; i++) {
            // Start with a single tile, cluster of 1
            let matchlength = 1;
            for (let j = 0; j < this.level.rows; j++) {
                let checkcluster = false;

                if (j === this.level.rows-1) {
                    // Last tile
                    checkcluster = true;
                } else {
                    // Check the type of the next tile
                    if (this.level.tiles[i][j].type == this.level.tiles[i][j+1].type &&
                        this.level.tiles[i][j].type != -1) {
                        // Same type as the previous tile, increase matchlength
                        matchlength += 1;
                    } else {
                        // Different type
                        checkcluster = true;
                    }
                }

                // Check if there was a cluster
                if (checkcluster) {
                    if (matchlength >= 3) {
                        // Found a vertical cluster
                        this.clusters.push({
                            column: i,
                            row: j + 1 - matchlength,
                            length: matchlength,
                            horizontal: false
                        });
                    }

                    matchlength = 1;
                }
            }
        }
    }

    // Find available moves
    private findMoves() {
        // Reset moves
        this.moves = []

         // Check horizontal swaps
        for (let j = 0; j < this.level.rows; j++) {
            for (let i = 0; i< this.level.columns-1; i++) {
                // Swap, find clusters and swap back
                this.swap(i, j, i+1, j);
                this.findClusters();
                this.swap(i, j, i+1, j);

                // Check if the swap made a cluster
                if (this.clusters.length > 0) {
                    // Found a move
                    this.moves.push({column1: i, row1: j, column2: i+1, row2: j});
                }
            }
        }

        // Check vertical swaps
        for (let i = 0;  i < this.level.columns; i++) {
            for (let j=0; j < this.level.rows-1; j++) {
                // Swap, find clusters and swap back
                this.swap(i, j, i, j+1);
                this.findClusters();
                this.swap(i, j, i, j+1);

                // Check if the swap made a cluster
                if (this.clusters.length > 0) {
                    // Found a move
                    this.moves.push({column1: i, row1: j, column2: i, row2: j+1});
                }
            }
        }

        // Reset clusters
        this.clusters = []
    }

    // Loop over the cluster tiles and execute a function
    private loopClusters(func: (i: number, column: number, row: number, cluster: any) => void) {
        for (let i = 0; i < this.clusters.length; i++) {
            //  { column, row, length, horizontal }
            const cluster: any = this.clusters[i];
            let coffset = 0;
            let roffset = 0;
            for (let j = 0; j < cluster.length; j++) {
                func(i, cluster.column + coffset, cluster.row + roffset, cluster);

                if (cluster.horizontal) {
                    coffset++;
                } else {
                    roffset++;
                }
            }
        }
    }

    // Remove the clusters
    private removeClusters() {
        // Change the type of the tiles to -1, indicating a removed tile
        this.loopClusters((index, column, row, cluster) => {
            this.level.tiles[column][row].type = -1;
        });

        // Calculate how much a tile should be shifted downwards
        for (let i = 0; i < this.level.columns; i++) {
            let shift = 0;
            for (let j = this.level.rows-1; j >= 0; j--) {
                // Loop from bottom to top
                if (this.level.tiles[i][j].type == -1) {
                    // Tile is removed, increase shift
                    shift++;
                    this.level.tiles[i][j].shift = 0;
                } else {
                    // Set the shift
                    this.level.tiles[i][j].shift = shift;
                }
            }
        }
    }

    // Shift tiles and insert new tiles
    private shiftTiles() {
        // Shift tiles
        for (let i = 0; i < this.level.columns; i++) {
             for (let j = this.level.rows-1; j >= 0; j--) {
                // Loop from bottom to top
                if (this.level.tiles[i][j].type == -1) {
                    // Insert new random tile
                    this.level.tiles[i][j].type = this.getRandomTile();
                } else {
                    // Swap tile to shift it
                    const shift = this.level.tiles[i][j].shift;
                    if (shift > 0) {
                        this.swap(i, j, i, j+shift)
                    }
                }

                // Reset shift
                this.level.tiles[i][j].shift = 0;
            }
        }
    }

    /*
     * Get the tile under the mouse
     *@param Object pos : {x, y}
     */
    private getMouseTile(pos: any) {
        // Calculate the index of the tile
        const tx = Math.floor((pos.x - this.level.x) / this.level.tilewidth);
        const ty = Math.floor((pos.y - this.level.y) / this.level.tileheight);

        // Check if the tile is valid
        if (tx >= 0 && tx < this.level.columns && ty >= 0 && ty < this.level.rows) {
            // Tile is valid
            return {
                valid: true,
                x: tx,
                y: ty
            };
        }

        // No valid tile
        return {
            valid: false,
            x: 0,
            y: 0
        };
    }

    // Check if two tiles can be swapped
    private canSwap(x1: number, y1: number, x2: number, y2: number) {
        // Check if the tile is a direct neighbor of the selected tile
        if ((Math.abs(x1 - x2) == 1 && y1 == y2) ||
            (Math.abs(y1 - y2) == 1 && x1 == x2)) {
            return true;
        }

        return false;
    }

    // Swap two tiles in the level
    private swap(x1: number, y1: number, x2: number, y2: number) {
        const typeswap = this.level.tiles[x1][y1].type;
        this.level.tiles[x1][y1].type = this.level.tiles[x2][y2].type;
        this.level.tiles[x2][y2].type = typeswap;
    }

    // Swap two tiles as a player action
    private mouseSwap(c1: number, r1: number, c2: number, r2: number) {
        // Save the current move
        this.currentmove = {column1: c1, row1: r1, column2: c2, row2: r2};

        // Deselect
        this.level.selectedtile.selected = false;

        // Start animation
        this.animationstate = 2;
        this.animationtime = 0;
        this.gamestate = this.gamestates.resolve;
     }

    // On mouse movement
    public onMouseMove(e: any) {
        this.dragging({clientX: e.clientX,  clientY: e.clientY});
    }
    public onTouchMove(e: any) {
        this.dragging({clientX: e.touches[0].clientX, clientY: e.touches[0].clientY});
    }

    private dragging(e: any) {
        // Get the mouse position
        const pos = this.getMousePos(this.canvas, {clientX: e.clientX,  clientY: e.clientY});

        // Check if we are dragging with a tile selected
        if (this.drag && this.level.selectedtile.selected) {
            // Get the tile under the mouse
            const mt = this.getMouseTile(pos);
            if (mt.valid) {
                // Valid tile

                // Check if the tiles can be swapped
                if (this.canSwap(mt.x, mt.y, this.level.selectedtile.column, this.level.selectedtile.row)){
                    // Swap the tiles
                    this.mouseSwap(mt.x, mt.y, this.level.selectedtile.column, this.level.selectedtile.row);
                }
            }
        }
    }
    // On mouse button click
    public onMouseDown(e: any) {
        this.pressed({clientX: e.clientX,  clientY: e.clientY});
    }
    public onTouchStart(e: any) {
        this.pressed({clientX: e.touches[0].clientX, clientY: e.touches[0].clientY});
    }


    private pressed(e: any) {
        // Get the mouse position
        const pos = this.getMousePos(this.canvas, {clientX: e.clientX,  clientY: e.clientY});
        // Start dragging
        if (!this.drag) {
            // Get the tile under the mouse
            const mt = this.getMouseTile(pos);
            if (mt.valid) {
                // Valid tile
                let swapped = false;
                if (this.level.selectedtile.selected) {
                    if (mt.x === this.level.selectedtile.column && mt.y === this.level.selectedtile.row) {
                        // Same tile selected, deselect
                        this.level.selectedtile.selected = false;
                        this.drag = true;
                        return;
                    } else if (this.canSwap(mt.x, mt.y, this.level.selectedtile.column, this.level.selectedtile.row)){
                        // Tiles can be swapped, swap the tiles
                        this.mouseSwap(mt.x, mt.y, this.level.selectedtile.column, this.level.selectedtile.row);
                        swapped = true;
                    }
                }

                if (!swapped) {
                    // Set the new selected tile
                    this.level.selectedtile.column = mt.x;
                    this.level.selectedtile.row = mt.y;
                    this.level.selectedtile.selected = true;
                }
            } else {
                // Invalid tile
                this.level.selectedtile.selected = false;
            }

            // Start dragging
            this.drag = true;
        }
    }

    public onMouseUp() {
        this.drag = false;
    }

    public onTouchEnd() {
        this.drag = false;
    }

    public onMouseOut() {
        // Reset dragging
        this.drag = false;
    }

     // Get the mouse position
    private getMousePos(canvas: any, e: any) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
            y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
        };
    }

    public onClickButton(act: string) {
        switch (act) {
            case 'new':
                this.newGame();
                break;
            case 'hint':
                this.showmoves = !this.showmoves;
                if (this.showmoves) {
                    setTimeout(()=>{this.showmoves = false}, 1000);
                }
                break;
            case 'ai':
                this.aibot = !this.aibot;
                break;
        }
    }


    //
    onResize(event: any) {
        // event.target.innerWidth;
        this.resizeCanvas();
    }

    private playSound(sound: string) {
        console.log('playSound')
        if (this.soundsEnable) { // 초기 사운드를 제거하기 위해 처리

            // if (!this.sounds.explode) {
            //     console.log('this.sounds.explode', this.sounds.explode)
            //     this.sounds[sound] = new Howl({
            //       src: ['/assets/sounds/explode.mp3'],
            //       preload: true,
            //     });
            // }

            if (this.configSvc.sound) {
                this.sounds[sound].play();
            }
        }
    }


}
