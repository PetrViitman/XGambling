import {Container, Sprite} from 'pixi.js';
import { TextField } from '../../text/TextField';
import { formatMoney } from '../../../Utils';


export class PayoutView extends Container {
    backgroundGlowView;
    
    textField;

    constructor(assets) {
        super();
        this.initBackgroundGlow(assets);
        this.initTextField(assets);
    }

    initBackgroundGlow(assets) {
        const sprite = new Sprite(assets['payout_background_glow']);
        sprite.anchor.set(0.5);
        sprite.scale.set(2);
        this.backgroundGlowView = this.addChild(sprite);
    }

    initTextField(assets) {
        const textField = new TextField({})
            .setFontName(
            '0123456789.,',
            [
                assets.payout_0,
                assets.payout_1,
                assets.payout_2,
                assets.payout_3,
                assets.payout_4,
                assets.payout_5,
                assets.payout_6,
                assets.payout_7,
                assets.payout_8,
                assets.payout_9,
                assets.payout_period,
                assets.payout_period,
            ])
            .setFontSize(100)
            .setText('1234567890.,')
            .setAlignCenter()
            .setAlignMiddle()
            .setHiddenCharacters([','])

        this.textField = this.addChild(textField)
    }

    presentPayout({
        width = 100,
        height = 100,
        payout = 1000,
        progress,
    }) {
        const {
            backgroundGlowView,
            textField,
        } = this;

        // ПОДЛОЖКА...
        const backgroundSubProgress = Math.min(1, progress * 2);
        backgroundGlowView.alpha = Math.min(1, Math.sin(Math.PI * backgroundSubProgress) * 2);
        backgroundGlowView.width = width * 1.5;

        backgroundGlowView.height = height * 1.75;
        backgroundGlowView.position.set(
            width / 2,
            height / 2,
        );
        // ...ПОДЛОЖКА

        // ТЕКСТ...
        textField.setMaximalWidth(width);
        textField.setMaximalHeight(height);
        textField.pivot.x = width / 2;
        textField.pivot.y = height / 2;
        textField.x = textField.pivot.x;
        textField.y = textField.pivot.y;
    

        textField.setText(formatMoney(payout))
        textField.scale.set(0.5 + 0.5 * Math.min(1,  Math.sin(Math.PI * progress) * 1.1) );
        textField.alpha = Math.min(1, Math.sin(Math.PI * progress) * 2.5);
        // ...ТЕКСТ
    }
}
