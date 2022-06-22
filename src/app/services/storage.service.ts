/**
import { Storage } from './services/storage.service';
*this.storage = new Storage();
*/
export class Storage {
    public data: any;
    private storageName = 'game.match3.data';

    constructor()
    {
        const data = localStorage.getItem(this.storageName);
        if(data) {
            this.data = JSON.parse(data);
        } else {
            this.resetData();
        }
    }

    private resetData() {
        this.data = {
            maxScore: 0,
        };
        this.save();
    }

    /**
    * 로컬 storage에 저장한다.
    */
    private save() {
        localStorage.setItem(this.storageName, JSON.stringify(this.data));
    }

    public clear() {
        localStorage.setItem(this.storageName, '');
        this.resetData();

    }

    set maxScore(score: number) {
        if (this.data.maxScore < score) {
            this.data.maxScore = score;
            this.save();
        }
    }

    get maxScore() {
        return this.data.maxScore;
    }
}
