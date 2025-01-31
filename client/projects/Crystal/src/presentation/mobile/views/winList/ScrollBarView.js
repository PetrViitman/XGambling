import {Container, Graphics} from 'pixi.js';

const WIDTH = 5;

function drawRoundedRectangle({
    graphics,
    height,
    color,
}) {
    const offsetHeight = 5;

    return graphics
        .clear()
        .beginFill(color)
        .drawRoundedRect(0, 0, WIDTH, offsetHeight * 2)
        .drawRect(0, offsetHeight, WIDTH, height - offsetHeight * 2)
        .drawRoundedRect(0, height - offsetHeight * 2, WIDTH, offsetHeight * 2)
        .endFill();
}

export class ScrollBarView extends Container {
    axisView;

    handleView;

    setHeight(height) {
        if (!this.axisView) {
            this.axisView = this.addChildAt(new Graphics(), 0);
        }

        drawRoundedRectangle({
            graphics: this.axisView,
            height,
            color: 0x212878,
        });
    }

    setHandleHeight(height) {
        if (!this.handleView) {
            this.handleView = this.addChild(new Graphics());
        }

        drawRoundedRectangle({
            graphics: this.handleView,
            height,
            color: 0x4a5eb5,
        });
    }
}
