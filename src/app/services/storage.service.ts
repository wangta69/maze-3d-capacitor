/**
import { Storage } from './services/storage.service';
*this.storage = new Storage();
*/
export class Storage {
    public data: any;
    private storageName = 'game.maze3d.data';

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
            level: 1,
            highLevel: 1
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

    set level(level: number) {
            this.data.level = level;
            this.save();
    }

    get level() {
        return this.data.level;
    }

    set highLevel(level: number) {
        if (this.data.highLevel < level) {
            this.data.highLevel = level;
            this.save();
        }
    }

    get highLevel() {
        return this.data.highLevel;
    }
}
