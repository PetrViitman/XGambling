import { PaytableContentView } from "./PaytableContentView";
import { ScrollableWindow } from "../ScrollableWindowView";

export class PaytableView extends ScrollableWindow {    
    initContent({assets, dictionary, coefficients, isLTRTextDirection}) {
        this.contentView = this
            .scrollableContainer
            .addChild(new PaytableContentView({assets, dictionary, coefficients, isLTRTextDirection}))

        this.contentView.scale.set(0.9)
        this.contentView.x = (1000 - this.contentView.width) / 2 - 10
    }

    refresh({bet, currencyCode}) {
        this.contentView.refresh({bet, currencyCode})
    }
}