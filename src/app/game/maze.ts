/**
* 미로 생성함수
*/
export class Maze {
    public result: any;


    constructor(Width: number, Height: number) {
        const maze = this.maze(Width, Height);
        this.result = this.display(maze);
    }

    private maze(x: number, y: number) {
        let n = x * y - 1;
        if (n < 0) {
            console.log('illegal maze dimensions');
            return;
        }
        const horiz = Array(x).fill(false).map(() => Array(y).fill(false));
        const verti = Array(x).fill(false).map(() => Array(y).fill(false));

        let here: any = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)];
        const path = [here];
        const unvisited: any = [];
        for (let j = 0; j < x + 2; j++) {
            unvisited[j] = [];
            for (let k = 0; k < y + 1; k++) {
                unvisited[j].push(j > 0 && j < x + 1 && k > 0 && (j !== here[0] + 1 || k !== here[1] + 1));
            }
        }
        while (0 < n) {
            const potential = [[here[0] + 1, here[1]], [here[0], here[1] + 1],
                [here[0] - 1, here[1]], [here[0], here[1] - 1]];
            const neighbors = [];
            for (let j = 0; j < 4; j++) {
                if (unvisited[potential[j][0] + 1][potential[j][1] + 1]) {
                    neighbors.push(potential[j]);
                }
            }
            if (neighbors.length) {
                n = n - 1;
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                unvisited[next[0] + 1][next[1] + 1] = false;
                if (next[0] === here[0]) {
                    horiz[next[0]][(next[1] + here[1] - 1) / 2] = true;
                } else {
                    verti[(next[0] + here[0] - 1) / 2][next[1]] = true;
                }
                path.push( here = next);
            } else {
                here = path.length ? path.pop(): [];
            }
        }
        return {x, y, horiz, verti};
    }

    private display(m: any) {
        const text = [];
        for (let j = 0; j < m.x * 2 + 1; j++) {
            const line = [];
            if (0 === j % 2) {
                for (let k = 0; k < m.y * 2 + 1; k++) {
                    if (0 === k % 2) {
                        line[k] = true;
                    } else {
                        if (j > 0 && m.verti[j / 2 - 1][Math.floor(k / 2)]) {
                            line[k] = false;
                        } else {
                            line[k] = true;
                        }
                    }
                }
            } else {
                for (let k = 0; k < m.y * 2 + 1; k++) {
                    if (0 === k % 2) {

                    //    console.log(j, k, (j - 1) / 2, k / 4 - 1)
                        if (k > 0 && m.horiz[(j - 1) / 2][k / 2 - 1]) {
                            line[k] = false;
                        } else {
                            line[k] = true;
                        }
                    } else {
                        line[k] = false;
                    }
                }
            }
            if (0 === j) {
                line[1] = false;
            }
            if (m.x * 2 - 1 === j) {
                line[2 * m.y] = false;
            }
            text.push(line);
            // text.push(line.join('') + '\r\n');
        }
        return text;
        // return text.join('');


    }


    private displayOrigin(m: any) {
        const text = [];
        for (let j = 0; j < m.x * 2 + 1; j++) {
            const line = [];
            if (0 === j % 2) {
                for (let k = 0; k < m.y * 4 + 1; k++) {
                    if (0 === k % 4) {
                        line[k] = '+';
                    } else {
                        if (j > 0 && m.verti[j / 2 - 1][Math.floor(k / 4)]) {
                            line[k] = ' ';
                        } else {
                            line[k] = '-';
                        }
                    }
                }
            } else {
                for (let k = 0; k < m.y * 4 + 1; k++) {
                    if (0 === k % 4) {

                    //    console.log(j, k, (j - 1) / 2, k / 4 - 1)
                        if (k > 0 && m.horiz[(j - 1) / 2][k / 4 - 1]) {
                            line[k] = ' ';
                        } else {
                            line[k] = '|';
                        }
                    } else {
                        line[k] = ' ';
                    }
                }
            }
            if (0 === j) {
                line[1] = line[2] = line[3] = ' ';
            }
            if (m.x * 2 - 1 === j) {
                line[4 * m.y] = ' ';
            }
            // console.log(line);
            text.push(line.join('') + '\r\n');
        }
        return text.join('');
    }
}
