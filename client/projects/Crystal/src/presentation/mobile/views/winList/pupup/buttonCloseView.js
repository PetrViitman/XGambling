import {Sprite} from 'pixi.js';

export class ButtonClose extends Sprite {
    constructor(loader) {
        super(loader.getResourceOrUndefined('button_close'));
        this.eventMode = 'static';
        this.cursor = 'pointer';
        this.scale.set(0.2);
    }
}
