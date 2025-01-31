import {Container, Sprite} from 'pixi.js';

export class CollapseView extends Container {
    sprites;

    frameIndex = 0;

    progress = 0;

    constructor(textures) {
        super();

        this.sprites = textures.map((texture, i) => {
            const sprite = new Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.visible = !i;

            return this.addChild(sprite);
        });
    }

    present(progress) {
        if (this.progress === progress) {
            return;
        }

        const {sprites} = this;
        const frameIndex = Math.trunc(progress * sprites.length);

        this.progress = progress;
        if (sprites[this.frameIndex]) {
            sprites[this.frameIndex].visible = false;
        }

        this.frameIndex = frameIndex;
        if (sprites[frameIndex]) {
            sprites[frameIndex].visible = true;
        }
    }
}
