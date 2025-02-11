import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { BackgroundGradientView } from "./BackgroundGradientView";
import { FooterGradientView } from "./FooterGradientView";

export class BackgroundView extends AdaptiveContainer {
    footerGradientView
    
    constructor(assets) {
        super()
        this.initBackgroundGradient(assets)
        this.initFooterGradient(assets)
    }

    initBackgroundGradient() {
        this.addChild(new BackgroundGradientView())
    }

    initFooterGradient(assets) {
        const view = new FooterGradientView(assets)
        this.footerGradientView = this.addChild(view)
    }
}