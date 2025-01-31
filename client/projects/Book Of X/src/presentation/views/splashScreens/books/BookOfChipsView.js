import { BookOfCoinsView } from "./BookOfCoinsView";

export class BookOfChipsView extends BookOfCoinsView {
    constructor(resources) {
        super(resources)
    }

    initCoins({resources}) {
        super.initCoins({
            resources,
            texture_prefix: 'chip_',
            glowColor: 0xCC0044
        })
    }
}