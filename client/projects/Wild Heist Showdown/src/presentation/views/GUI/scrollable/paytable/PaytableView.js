import { PaytableContentView } from "./PaytableContentView";
import { ScrollableWindow } from "../ScrollableWindowView";

export class PaytableView extends ScrollableWindow {    
    initContent({assets, dictionary, coefficients, isLTRTextDirection}) {
        this.contentView = this
            .scrollableContainer
            .addChild(new PaytableContentView({assets, dictionary, coefficients, isLTRTextDirection}))

        this.contentView.scale.set(0.97)
    }

    refresh({bet, currencyCode}) {
        this.contentView.refresh({bet, currencyCode})
    }
}