import { Container } from "pixi.js";
import { TextField } from "../text/TextField";
import { Timeline } from "../../timeline/Timeline";
import { SpineView } from "../SpineView";
import { formatMoney } from "../../Utils";

export class BigWinView extends Container {
    spineView
    payoutView
    coinRainView
    bigWinCurrencyView
    reelsView
    timeline = new Timeline()

    constructor(assets, dictionary) {
        super()

        this.initSpine(assets)
        this.initTexts(assets, dictionary)
    }

    initSpine(assets) {
        const view = new SpineView(assets.big_win.spineData)
		this.spineView = this.addChild(view)
    }

    initTexts(assets, dictionary) {
        const contentContainer = new Container();
        contentContainer.scale.y = -1;

        // ЗАГОЛОВОК...
        const headerWidth = 300;
        const headerHeight = 40;
        const headerView = contentContainer
            .addChild(new TextField({}))
            .setMaximalWidth(headerWidth)
            .setMaximalHeight(headerHeight)
            .setFontName('roboto')
            .setFontSize(100)
            .setFontColor(0xd2e99d)
            .setText(dictionary.total_win_bmp)
            .setAlignCenter()
            .setAlignMiddle();

        headerView.pivot.set(headerWidth / 2, headerHeight / 2);
        headerView.y = -60;
        // ...ЗАГОЛОВОК

        // ВЫПЛАТА...
        const payoutWidth = 300;
        const payoutHeight = 80;
        const payoutSymbols = '0123456789';
        const payoutView = contentContainer
            .addChild(new TextField({}))
            .setMaximalWidth(payoutWidth)
            .setMaximalHeight(payoutHeight)
            .setFontName(
                payoutSymbols + '.,',
                [
                    ...[
                        ...payoutSymbols.split(''),
                        'period',
                        'period',
                    ].map((symbol) => assets['payout_' + symbol],
                    ),
                ],
            )
            .setFontSize(100)
            .setText('1234567890.,')
            .setAlignCenter()
            .setAlignMiddle();

        payoutView.pivot.set(payoutWidth / 2, payoutHeight / 2);

        const slotIndex = this
            .spineView
            .skeleton
            .findSlotIndex('text')

        this.spineView
            .slotContainers[slotIndex]
            .addChild(contentContainer);
        
        this.payoutView = payoutView;
        // ...ВЫПЛАТА

        // ВАЛЮТА...
        const currencyWidth = 300;
        const currencyHeight = 40;
        const currencyView = contentContainer
            .addChild(new TextField({}))
            .setMaximalWidth(currencyWidth)
            .setMaximalHeight(currencyHeight)
            .setFontColor(0xe2b45d)
            .setFontName('roboto')
            .setFontSize(100)
            .setText('RUB')
            .setAlignCenter()
            .setAlignMiddle();

        currencyView.pivot.set(currencyWidth / 2, currencyHeight / 2);
        currencyView.y = 60;
        this.bigWinCurrencyView = currencyView;
        // ...ВАЛЮТА
    }

    async present(totalPayout = 123, currencyCode = '') {
        const {spineView} = this;

        this.payoutView.setText(formatMoney(totalPayout)).hideSpriteCharacter(',')
        this.bigWinCurrencyView.setText(currencyCode);
        spineView.playAnimation({
            name: 'win_total'
        })

        return this.timeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 2500,
                onProgress: (progress) => {
                    this.reelsView?.setBrightness({
                        brightness: 1 - Math.min(1, Math.sin(Math.PI * progress) * 2)
                    })
                },
            })
            .play()
    }

    setTimeScale(scale) {
		const scaleDescriptor = {name: 'scale', value: scale}
		this.timeline.setTimeScaleFactor(scaleDescriptor)
        this.spineView.setTimeScale({timeScale: scale})
	}
}