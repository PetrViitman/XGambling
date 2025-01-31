import {Application, BitmapFont, Container, Sprite} from 'pixi.js';
import {BaseAdaptiveContainer} from '@/libs/adaptive-container/src';
import {InteractiveWinListView} from '../InteractiveWinListView';
import {ButtonClose} from './buttonCloseView';
import {Timeline} from '../../../timeline/Timeline';
import {TextField} from '../../text/TextField';

export class WinListPopup {
    pixiApplication;

    contentContainer;

    overlayContainer;

    hooksViews;

    panelContainer;

    winListView;

    portraitPanelView;

    landscapePanelView;

    buttonCloseView;

    glowView;

    timeline = new Timeline();

    disclaimerFadeTimeline = new Timeline;

    isRTL;

    headerTextView;

    disclaimerTextView;

    disclaimerView;

    constructor({
        wrapperHTMLElementId,
        loader,
        uncompressedTextures,
        bitmapTexts,
        isRTL,
        headerText,
        disclaimerText,
    }) {
        this.isRTL = isRTL;

        this.pixiApplication = new Application({
            backgroundAlpha: 0,
        });

        this.pixiApplication
            .renderer
            .resolution = window.devicePixelRatio;

        const canvas = this.pixiApplication.view;
        document.getElementById(wrapperHTMLElementId)
            .appendChild(canvas);

        canvas.style.width = '100%';
        canvas.style.height = '100%';

        this.initBitmapFonts(bitmapTexts);
        this.initContainers();
        this.initGlow(loader);
        this.initPanel(loader);
        this.initDisclaimer(loader);
        this.initTexts(headerText, disclaimerText);
        this.initWinList({
            loader,
            uncompressedTextures,
            isRTL,
        });
        this.initCloseButton(loader);
        this.onResize();
    }

    initContainers() {
        // CONTENT CONTAINER...
        this.contentContainer = this
            .pixiApplication
            .stage
            .addChild(
                new BaseAdaptiveContainer(),
            );
        this.contentContainer
            .updateTargetArea = (sidesRatio) => {
                this.updateTargetArea(sidesRatio);
            };
        // ...CONTENT CONTAINER

        // BLACK BACKGROUND OVERLAY...
        const overlayContainer = this
            .contentContainer
            .addChild(new BaseAdaptiveContainer())
            .setSourceArea({width: 100, height: 100})
            .setTargetArea({x: 0, y: 0, width: 1, height: 1})
            .highlight(0x261F51, 0.6)
            .stretchHorizontally()
            .stretchVertically();

        overlayContainer.eventMode = 'static';
        overlayContainer
            .on('pointerdown', (event) => {
                event.stopPropagation();
                this.onOverlayClick();
            });

        this.overlayContainer = overlayContainer;
        // ...BLACK BACKGROUND OVERLAY

        // POPUP PANEL CONTAINER...
        this.panelContainer = this
            .contentContainer
            .addChild(
                new BaseAdaptiveContainer(),
            );
        // ...POPUP PANEL CONTAINER
    }

    initBitmapFonts(bitmapTexts = ['']) {
        BitmapFont.from(
            'roboto',
            {
                fill: '#FFFFFF',
                fontFamily: 'roboto',
                fontSize: 200,
                fontWeight: 'bold',
            },
            {
                chars: '0123456789,.xABCDEFGHIJKLMNOPQRSTYUVWXYZ '
                + bitmapTexts.join('').split(''),
            },
        );

        BitmapFont.from(
            'roboto_thin',
            {
                fill: '#FFFFFF',
                fontFamily: 'roboto',
                fontSize: 200,
            },
            {
                chars: '0123456789,.xABCDEFGHIJKLMNOPQRSTYUVWXYZ '
                + bitmapTexts.join('').split(''),
            },
        );
    }

    initGlow(loader) {
        const view = new Sprite(loader.getResourceOrUndefined('panel_glow'));
        view.anchor.set(0.5);
        view.tint = 0x79e7ff;
        this.glowView = this.panelContainer.addChild(view);

        new Timeline()
            .addAnimation({
                duration: 5000,
                onProgress: (progress) => {
                    view.alpha = 1 - 0.25 * Math.abs(Math.cos(Math.PI * 2 * progress));
                },
            })
            .setLoopMode()
            .play();
    }

    initPanel(loader) {
        this.hooksViews = [0, 1].map(() => {
            const view = new Sprite(loader.getResourceOrUndefined('popup_hook'));
            view.anchor.set(0, 0.5);
            view.scale.set(0.2);

            return this.panelContainer.addChild(view);
        });

        this.hooksViews[0].scale.x = -0.2;

        const views = ['portrait', 'landscape']
            .map((postfix, i ) => {
                const container = new Container();
                container.visible = false;
                container.position.set(-20, i ? -50 : -65);

                // BACKGROUND...
                let view = new Sprite(loader.getResourceOrUndefined('panel_' + postfix));
                view.anchor.set(0.5);
                view.position.set(view.width / 2, view.height / 2);
                view.scale.set(0.85);
                container.addChild(view);
                // ...BACKGROUND

                // FOREGROUND...
                view = new Sprite(loader.getResourceOrUndefined('panel_' + postfix));
                view.anchor.set(0.5);
                view.position.set(view.width / 2, view.height / 2 + (i ? 60 : 75));
                container.addChild(view);
                // ...FOREGROUND
                container.eventMode = 'static';
                
                return this.panelContainer.addChild(container);
            });

        this.portraitPanelView = views[0];
        this.landscapePanelView = views[1];
    }

    initWinList({loader, uncompressedTextures, isRTL}) {
        const winListView = new InteractiveWinListView({
            loader,
            uncompressedTextures,
            isRTL, 
        });
        
        winListView.y = 30;

        this.winListView = winListView;
        this.panelContainer.addChild(winListView);
    }

    initCloseButton(loader) {
        const view = new ButtonClose(loader);
        view.on('pointerdown', (event) => {
            event.stopPropagation();
            this.onCloseButtonClick();
        });
        
        this.buttonCloseView = this
            .panelContainer
            .addChild(view);
    }

    initDisclaimer(loader) {
        const container = new Container();
        const sprite = container
            .addChild(
                new Sprite(loader.getResourceOrUndefined('mouse')),
            );
        sprite.scale.set(0.175);
        sprite.anchor.set(0.5);
        
        this.panelContainer.addChild(container);
        this.disclaimerView = container;
    }

    initTexts(headerText, disclaimerText) {
        const views = ['roboto', 'roboto_thin'].map((fontName) => {
            const  textField = new TextField({})
                .setAlignCenter()
                .setAlignMiddle()
                .setFontName(fontName);

            return this
                .panelContainer
                .addChild(textField);
        });

        this.headerTextView = views[0];
        this.headerTextView.setMaximalHeight(25);
        this.headerTextView.y = -5;
        this.headerTextView.setText(headerText.replaceAll('<br>', '\n'));

        this.disclaimerTextView = views[1];
        this.disclaimerTextView.setFontSize(14);
        this.disclaimerTextView.setText(disclaimerText.replaceAll('<br>', '\n'));
        this.disclaimerView.addChild(views[1]);
        views[1].position.set(0);
    }

    onResize() {
        BaseAdaptiveContainer.onResize();
        this.contentContainer.onResize();
        const {
            innerWidth,
            innerHeight,
        } = window;

        this.pixiApplication
            .renderer
            .resize(
                innerWidth,
                innerHeight,
            );
    }

    setInteractive(isInteractive = true) {
        const eventMode = isInteractive ? 'static' : 'none';

        this.overlayContainer.eventMode = eventMode;
        this.buttonCloseView.eventMode = eventMode;
    }

    updateTargetArea(sidesRatio) {
        const {
            panelContainer,
            hooksViews,
            glowView,
            winListView,
            landscapePanelView,
            portraitPanelView,
            buttonCloseView,
            isRTL,
            headerTextView,
            disclaimerTextView,
            disclaimerView,
        } = this;

        if (sidesRatio >= 1) {
            disclaimerView.position.set(165, 100);
            disclaimerTextView
                .setMaximalWidth(300)
                .setMaximalHeight(40)
                .position.set(-150, 43);

            
            headerTextView.setMaximalWidth(275);
            headerTextView.pivot.set(
                headerTextView.maximalWidth / 2,
                headerTextView.maximalHeight / 2,
            );
            headerTextView.x = 165;

            hooksViews[0].position.set(-16, 120);
            hooksViews[1].position.set(347, 120);

            glowView.position.set(160, 90);
            glowView.width = 600;
            glowView.height = 400;

            buttonCloseView.position.set( isRTL ? -25 : 333, -5);

            winListView.x = 3;
            winListView.scale.set(0.775);
            winListView.setExpansionFactor(1.5);
            winListView.setMaskSize(420, 230);
            panelContainer
                .setSourceArea({width: 330, height: 180})
                .setTargetArea({x: 0.2, y: 0.1, width: 0.6, height: 0.575});
        } else {
            disclaimerView.position.set(120, 155);
            disclaimerTextView
                .setMaximalWidth(210)
                .setMaximalHeight(40)
                .position.set(-110, 63);

            headerTextView.setMaximalWidth(180);
            headerTextView.pivot.set(
                headerTextView.maximalWidth / 2,
                headerTextView.maximalHeight / 2,
            );
            headerTextView.x = 117;

            hooksViews[0].position.set(-16, 185);
            hooksViews[1].position.set(247, 185);

            glowView.position.set(110, 150);
            glowView.width = 500;
            glowView.height = 600;

            buttonCloseView.position.set( isRTL ? -20 : 225, 2);

            winListView.x = 5;
            winListView.scale.set(0.775);
            winListView.setExpansionFactor(0.98);
            winListView.setMaskSize(320, 415);
            panelContainer
                .setSourceArea({width: 230, height: 320})
                .setTargetArea({x: 0.125, y: 0.125, width: 0.75, height: 0.575});
        }

        landscapePanelView.visible = sidesRatio >= 1;
        portraitPanelView.visible = !landscapePanelView.visible;

        winListView.setScrollProgress();
    }

    onOverlayClick() {
        //
    }

    onCloseButtonClick() {
        //
    }

    async setVisible(isVisible = true) {
        isVisible || this.setInteractive(false);

        await this
            .timeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 175,
                onProgress: isVisible
                    ? (progress) => {
                        this.contentContainer.alpha = progress;
                    }
                    : (progress) => {
                        this.contentContainer.alpha = 1 - progress;
                    },
            })
            .play();

        isVisible && this.setInteractive();
        BaseAdaptiveContainer.onResize();
    }

    presentWin(descriptors) {
        const {disclaimerView} = this;

        this.disclaimerFadeTimeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 100,
                onProgress: (progress) => {
                    disclaimerView.alpha = Math.min(
                        disclaimerView.alpha,
                        1 - progress,
                    );
                },
            })
            .play();

        return this.winListView.presentWin(descriptors);
    }

    presentDrop() {
        const {disclaimerView} = this;

        this.disclaimerFadeTimeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 100,
                onProgress: (progress) => {
                    disclaimerView.alpha = Math.max(
                        disclaimerView.alpha,
                        progress,
                    );
                },
            })
            .play();

        return this.winListView.presentDrop();
    }
}
