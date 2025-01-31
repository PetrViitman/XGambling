import { MobilePresentation } from "../mobile/MobilePresentation";
import { DesktopBackgroundView } from "./views/DesktopBackgroundView";
import { DesktopReelsView } from "./views/reels/DesktopReelsView";

export class DesktopPresentation extends MobilePresentation {
	constructor(parameters) {
		super({backgroundColor: 0x110359, ...parameters})
	}
	
    initReels({
		initialReels,
		coefficients
	}) {
		const {
			pixiApplication: {stage},
			assets,
			dictionary,
			isMobileDevice,
		} = this

		this.reelsView = stage.addChild(
			new DesktopReelsView({
				initialSymbolsIds: initialReels,
				assets,
				dictionary,
				coefficients,
				isMobileDevice
			}))
	}

	initBackground() {
		const {
			pixiApplication: {stage},
			assets,
		} = this

		stage.addChild(new DesktopBackgroundView(assets))
	}

	presentMessage({
        text,
        forcePresent,
        color,
    }) {
        this.reelsView.presentMessage({
			text,
			forcePresent,
			color,
		})
    }
}