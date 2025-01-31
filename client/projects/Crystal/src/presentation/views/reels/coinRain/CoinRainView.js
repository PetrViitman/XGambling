
import { Timeline } from '../../../timeline/Timeline';
import { AdaptiveContainer } from '../../adaptiveDesign/AdaptiveContainer';
import {CoinView} from './CoinView';
import {GemView} from './GemView';

const DESCRIPTORS = [
    {
        x: 200,
        delay: 0,
        duration: 1000,
        scale: 0.65,
    },
    {
        x: 400,
        delay: 500,
        duration: 1000,
        scale: 0.65,
    },
    {
        x: 800,
        delay: 300,
        duration: 1000,
        scale: 0.65,
    },
    {
        x: 800,
        delay: 300,
        duration: 1000,
        scale: 0.65,
    },
    {
        x: 160,
        delay: 100,
        duration: 600,
        scale: 1,
        gemType: 0,
    },
    {
        x: 860,
        delay: 400,
        duration: 550,
        scale: 1,
        gemType: 1,
    },
    {
        x: 75,
        delay: 0,
        duration: 700,
        scale: 1,
        gemType: 2,
    },
    {
        x: 650,
        delay: 750,
        duration: 800,
        scale: 0.75,
        gemType: 3,
    },
    {
        x: 750,
        delay: 150,
        duration: 860,
        scale: 0.5,
        gemType: 4,
    },
    {
        x: 250,
        delay: 100,
        duration: 760,
        scale: 0.5,
        gemType: 5,
    },
    {
        x: 50,
        delay: 0,
        duration: 500,
        scale: 1,
    },
    {
        x: 250,
        delay: 300,
        duration: 500,
        scale: 1,
    },
    {
        x: 500,
        delay: 100,
        duration: 500,
        scale: 1,
    },
    {
        x: 700,
        delay: 0,
        duration: 450,
        scale: 1,
    },
    {
        x: 900,
        delay: 300,
        duration: 450,
        scale: 1,
    },
]

export class CoinRainView extends AdaptiveContainer {
    timeline = new Timeline
    gemsViews;

    constructor(assets) {
        super();

        this.setSourceArea({width: 1000, height: 1000})
            .setTargetArea({x: 0, y: 0, width: 1, height: 1})
            .stretchHorizontally()
            .stretchVertically();

        this.initGems(assets);
        this.onAdjustedToTargetArea();
        this.setProgress();
    }

    initGems(assets) {
        this.gemsViews = [
            ...DESCRIPTORS.map(({scale, gemType}) => {
                const view = gemType === undefined
                    ? new CoinView(assets)
                    : new GemView(assets, gemType);

                view.setScale(scale);

                return this.addChild(view);
            }),
        ];
    }

    setProgress(progress = 0) {
        DESCRIPTORS.forEach(
            (
                {
                    delay,
                    duration,
                    x,
                }, 
                i) => {
                const elapsedTime = progress * 2000;
                const gemView = this.gemsViews[i];
                const finalProgress = Math.max(0, (elapsedTime - delay) / duration) % 1;
                const flipProgress = Math.abs(Math.sin(Math.PI * 1 * finalProgress));

                gemView.setFlipProgress?.(flipProgress);
                gemView.setRotation(Math.PI * 3 * finalProgress);
                gemView.x = x;
                gemView.y = -100 + 1200 * finalProgress ** 2;
            });

        this.alpha = Math.min(1, Math.sin(Math.PI * progress) * 3);
    }

    onAdjustedToTargetArea() {
        const scaleFactor = Math.min(this.scale.x, this.scale.y) * 1.5;

        this.gemsViews.forEach((view) => {
            view.scale.set(
                1 / this.scale.x * scaleFactor,
                1 / this.scale.y * scaleFactor,
            );
        });
    }


    present() {
        return this
            .timeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 2500,
                onProgress: progress => this.setProgress(progress)
            })
            .play()
    }
}
