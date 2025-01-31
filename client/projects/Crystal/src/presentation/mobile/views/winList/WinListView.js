import {Container, Graphics} from 'pixi.js';
import {WinListItemView} from './WinListItemView';
import { Timeline } from '../../timeline/Timeline';


const ITEM_HEIGHT = 59;

export class WinListView extends Container {
    itemsContainer;

    descriptors = [];

    itemsViews = [];

    assets;

    timeline = new Timeline();

    isRTL;

    expansionFactor = 1;

    constructor({
        assets,
        isRTL,
    }) {
        super();
        this.assets = assets;
        this.initItemsContainer();
        this.initMask();
        this.isRTL = isRTL;

        document.addEventListener('keyup', () => {
            this.presentWin([
                {
                    symbolId: 1,
                    count: 5,
                    coefficient: 1,
                    payout: 1000,
                    currencyCode: 'FUN',
                }
            ])
        })
    }

    initItemsContainer() {
        this.itemsContainer = this.addChild(new Container());
        this.itemsContainer.x = 21;
        this.itemsContainer.pivot.y = ITEM_HEIGHT / 2;
    }

    initMask() {
        this.mask = this
            .addChild(new Graphics())
            .beginFill(0xFF0000, 0.5)
            .drawRect(0, 0, 123, 123)
            .endFill();
    }

    getContentHeight() {
        return this.itemsViews.length * ITEM_HEIGHT;
    }

    getItemView(index) {
        const {
            itemsViews,
            assets
        } = this;

        if (!itemsViews[index]) {
            const view = new WinListItemView({
                assets,
                isRTL: this.isRTL
            });
            itemsViews.push(this.itemsContainer.addChild(view));
        }

        itemsViews[index].alpha = 1;
        itemsViews[index].visible = true;
        itemsViews[index].skew.y = 0;
        itemsViews[index].setExpansionFactor(this.expansionFactor);

        return itemsViews[index];
    }

    async presentWin(descriptors) {
        this.itemsContainer.y = this.mask.height;

        await this
            .timeline
            .deleteAllAnimations()
            .addAnimation({
                delay: 750,
                duration: 200,
                onProgress: (progress) => {
                    this.descriptors.forEach(({
                        symbolId,
                        coordinates,
                        coefficient = 1,
                        currencyCode = '',
                        payout,
                    }, i) => {
                        const view = this.getItemView(i);
                        view.y =
                            - ITEM_HEIGHT * i
                            - descriptors.length * ITEM_HEIGHT * progress;
                        view.presentWin({
                            symbolId,
                            count: coordinates.length,
                            coefficient,
                            payout,
                            progress: 1,
                            currencyCode,
                        });

                        if (i < descriptors.length) {
                            view.countView.alpha = 1 - Math.sin(Math.PI * progress);
                        }
                    });

                    this.onWinPresentation?.(progress);
                },
            })
            .addAnimation({
                delay: 750,
                duration: 400,
                onProgress: (progress) => {
                    descriptors.forEach(({
                        symbolId,
                        count = 5,
                        coefficient = 1,
                        currencyCode = '',
                        payout,
                    }, i) => {
                        const index = this.descriptors.length + i;
                        const view = this.getItemView(index);
                        view.presentWin({
                            symbolId,
                            count,
                            coefficient,
                            payout,
                            progress,
                            currencyCode,
                        });
                        view.y = - ITEM_HEIGHT * i;
                    });
                },
                onFinish: () => {
                    this.descriptors = [...descriptors, ...this.descriptors];
                },
            })
            .play();
    }

    presentItemsDrop() {
        this.itemsViews = this.itemsViews.sort((view1, view2) => {
            return view2.y - view1.y;
        });

        return this
            .timeline
            .wind(1)
            .deleteAllAnimations()
            .addAnimation({
                duration: 300,
                onProgress: (progress) => {
                    this.onItemsDrop?.(progress);
                    this.itemsViews.forEach((view, i) => {
                        view.alpha = Math.min(view.alpha, 1 - Math.min(1, progress * (i + 1)));
                        view.visible = !!view.alpha;
                    });
                },
                onFinish: () => {
                    this.descriptors = [];
                },
            })
            .play();
    }

    setExpansionFactor(expansionFactor = 1) {
        this.expansionFactor = expansionFactor;
        this.itemsViews.forEach((view) => {
            view.setExpansionFactor(expansionFactor);
        });
    }

    setMaskSize(width, height) {
        const {mask} = this;
        mask.width = width;
        mask.height = height;
    }

    setTimeScale(scale) {
        this.timeline.setTimeScaleFactor({name: 'scale', value: scale})
    }
}
