import {Container, Sprite} from 'pixi.js';

export class GemView extends Container {
    contentContainer;
    
    constructor(assets, gemType) {
        super();

        this.contentContainer = this.addChild(new Container());

        const sprite = new Sprite(assets['symbol_' + (gemType + 1) + '_0']);
        sprite.anchor.set(0.5);
        this.contentContainer.addChild(sprite);
    }

    setScale(scale = 1) {
        this.contentContainer.scale.set(scale);
    }

    setRotation(rotation = 0) {
        this.contentContainer.rotation = rotation;
    }
}
