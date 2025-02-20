import {BLEND_MODES, Container, Sprite} from 'pixi.js';
import { Timeline } from '../../timeline/Timeline';
import { TextField } from '../text/TextField';
import { formatMoney } from '../../Utils';


const GRADIENT_COLORS = [
    0xFFFFFF,
    0xFFFFFF,
    0xdc0918,
    0xed08f2,
    0x07ec09,
    0xe16912,
    0x09bb98,
    0x0170ef,
];

export class WinListItemView extends Container {
    contentContainer;

    countView;

    coefficientView;

    payoutTextView;

    panelView;

    symbolsContainer;

    symbolsViews = [];

    symbolsMap = {};

    gradientView;

    frameView;

    currentSymbolId;

    timeline = new Timeline(false);

    isRTL;

    constructor({
        assets,
        isRTL,
    }) {
        super();

        this.isRTL = isRTL;

        this.contentContainer = this.addChild(new Container());
        this.initPanel(assets);
        this.initFrame(assets);
        this.initSymbols(assets);
        this.initTextFields();
        this.initTimeline();
        this.setMirrored(isRTL);

        this.setExpansionFactor();
    }

    setMirrored(isMirrored = false) {
        const scaleFactor = isMirrored ? -1 : 1;
        this.contentContainer.scale.x = scaleFactor;
        this.contentContainer.x = isMirrored ? 248 : 0;

        this.countView.wrapper.scale.x = scaleFactor;
        this.coefficientView.wrapper.scale.x = scaleFactor;
        this.payoutTextView.wrapper.scale.x = scaleFactor;
        this.symbolsContainer.scale.x = scaleFactor;
    }

    initPanel(assets) {
        const views = [
            'win_list_background',
            'win_list_gradient',
        ].map((name) => {
            const view = new Sprite(assets[name]);
            view.x = 32;
            view.anchor.y = 0.475;

            return this.contentContainer.addChild(view);
        });

        this.panelView = views[0];
        this.panelView.tint = 0x102791;
        this.gradientView = views[1];
    }

    generateTextField(maximalWidth = 25, maximalHeight = 40) {
        const container = this
            .contentContainer
            .addChild(new Container());
    
        const view = new TextField({
            maximalWidth,
            maximalHeight,
        })
            .setFontName('default')
            .setAlignCenter()
            .setAlignMiddle()
            .setFontColor(0xFF0000)
            .setFontSize(20);

        view.pivot.set(
            maximalWidth / 2,
            maximalHeight / 2,
        );

        view.wrapper = container;

        return container.addChild(view);
    }

    initTextFields() {
        this.countView = this.generateTextField().setFontColor(0xb1dcff).setFontSize(26);

        this.coefficientView = this.generateTextField(40).setFontColor(0xffffff);
        this.coefficientView.wrapper.x = 95;

        this.payoutTextView = this.generateTextField(117).setFontColor(0xffc800);
        this.payoutTextView.wrapper.x = 188;

        if (this.isRTL) {
            this.payoutTextView.setAlignLeft();
        } else {
            this.payoutTextView.setAlignRight();
        }
    }

    initFrame(assets) {
        const container = new Container();
        const sprite = new Sprite(assets.win_list_frame);
        sprite.x = 28;
        sprite.wrapper = container;
        sprite.anchor.set(0.2, 0.5);
        this.frameView = container.addChild(sprite);
        this.contentContainer.addChild(container);
    }

    initSymbols(assets) {
        const symbolsContainer = this
            .contentContainer
            .addChild(new Container());

        for (let i = 0; i < 7; i++) {
            const container = symbolsContainer.addChild(new Container());
            container.visible = false;

            const texture = assets['symbol_' + i + '_0']
            // GEM...
            const view = new Sprite(texture);
            view.anchor.set(0.5);
            container.addChild(view);
            this.symbolsViews.push(container);
            this.symbolsMap[i + 1] = container
            // ...GEM

            // GLOW...
            const glowView = new Sprite(texture);
            glowView.anchor.set(0.5);
            glowView.blendMode = BLEND_MODES.ADD;
            container.glowView = container.addChild(glowView);
            // ...GLOW
        }

        symbolsContainer.x = 43;
        this.symbolsContainer = symbolsContainer;
    }

    initTimeline() {
        const {
            timeline,
            panelView,
            gradientView,
            coefficientView,
            countView,
            payoutTextView,
            frameView,
        } = this;

        timeline
            .addAnimation({
                duration: 100,
                onProgress: (progress) => {
                    frameView.scale.x = 0;
                    this.getSymbolView().scale.set(0);
                    panelView.alpha = 0;
                    gradientView.scale.x = 0;
                    coefficientView.alpha = 0;
                    payoutTextView.alpha = 0;
                    // COUNT...
                    countView.scale.set(progress * 1.25);
                },
            })
            .addAnimation({
                delay: timeline.duration,
                duration: 200,
                onProgress: (progress) => {
                    countView.scale.set(1.25 - 0.25 * progress);
                },
            })
            // ...COUNT
            // FRAME...
            .addAnimation({
                delay: 100,
                duration: 200,
                onProgress: (progress) => {
                    frameView.scale.x = progress * 1.25;
                },
            })
            .addAnimation({
                delay: 300,
                duration: 300,
                onProgress: (progress) => {
                    frameView.scale.x = 1.25 - 0.25 * progress;
                },
            })
            // ...FRAME
            // SYMBOL...
            .addAnimation({
                delay: 100,
                duration: 300,
                onProgress: (progress) => {
                    this.getSymbolView().scale.set(progress * 0.75);
                    this.getSymbolView().alpha = progress;
                },
            })
            .addAnimation({
                delay: 400,
                duration: 400,
                onProgress: (progress) => {
                    this.getSymbolView().scale.set(0.75 - 0.25 * progress);
                    this.getSymbolView().glowView.alpha = 1 - progress;
                },
            })
            // ...SYMBOL
            // PANEL...
            .addAnimation({
                delay: 300,
                duration: 200,
                onProgress: (progress) => {
                    panelView.alpha = progress;
                    gradientView.scale.x = progress;
                },
            })
            .addAnimation({
                delay: 400,
                duration: 300,
                onProgress: (progress) => {
                    gradientView.alpha = 1 - 0.3 * Math.sin(Math.PI * progress);
                },
            })
            // ...PANEL
            // COEFFICIENT + PAYOUT...
            .addAnimation({
                delay: 400,
                duration: 100,
                onProgress: (progress) => {
                    coefficientView.alpha = Math.min(1, progress * 2);
                    payoutTextView.alpha = progress;
                },
            });
        // ...COEFFICIENT + PAYOUT
    }

    getSymbolView(symbolId = this.currentSymbolId) {
        return this.symbolsMap[symbolId ?? 1];
    }

    presentSymbol(symbolId = 1) {
        if (this.currentSymbolId === symbolId) { return; }

        this.getSymbolView().visible = false;
        this.getSymbolView().glowView.visible = false;

        this.currentSymbolId = symbolId;
        this.getSymbolView().visible = true;
        this.getSymbolView().glowView.visible = true;

        this.gradientView.tint = GRADIENT_COLORS[symbolId] ?? 0xFFFFFF;
    }

    presentWin({
        symbolId = 0,
        count = 5,
        coefficient = 1,
        payout = 1000,
        progress = 0,
        currencyCode = '',
    }) {
        this.presentSymbol(symbolId);
        this.countView.setText(count + '');
        this.coefficientView.setText('x' + coefficient + '');

        const payoutTextPrefix = this.isRTL ? currencyCode + ' ' : '';
        const payoutTextPostfix = this.isRTL ? '' : ' ' + currencyCode;

        this.payoutTextView.setText(
            payoutTextPrefix
            + formatMoney(payout).replaceAll(',', ' ')
            + payoutTextPostfix);

        this.timeline
            .wind(0)
            .wind(progress);
    }

    setPanelTransparency(alpha) {
        this.gradientView.alpha = alpha;
        this.panelView.alpha = alpha;
    }

    setExpansionFactor(expansionFactor = 1) {
        this.scale.x = expansionFactor;

        const scaleFactor = 1 / expansionFactor;
        const scaleFactorRTL = this.isRTL ? -scaleFactor : scaleFactor; 
        this.frameView.wrapper.scale.x = scaleFactor;

        this.countView.wrapper.scale.x = scaleFactorRTL;
        this.coefficientView.wrapper.scale.x = scaleFactorRTL;
        this.coefficientView.wrapper.x = 95 * scaleFactor;

        this.payoutTextView.wrapper.scale.x = scaleFactorRTL;

        this.symbolsContainer.scale.x = scaleFactorRTL;
        this.symbolsContainer.x = 43 * scaleFactor;
    }
}
