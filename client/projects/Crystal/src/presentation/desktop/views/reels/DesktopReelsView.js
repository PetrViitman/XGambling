import { Sprite } from "pixi.js";
import { ReelsView } from "../../../mobile/views/reels/ReelsView";
import { SpineView } from "../../../mobile/views/SpineView";
import { Timeline } from "../../../mobile/timeline/Timeline";
import { REELS_HEIGHT, REELS_WIDTH } from "../../../mobile/Constants";
import { InteractiveWinListView } from "../../../mobile/views/winList/InteractiveWinListView";
import { InfoBarView } from "./InfoBarView";

export class DesktopReelsView extends ReelsView {
	infoBarView

    constructor({
		initialSymbolsIds,
		assets,
		dictionary,
		coefficients,
		isMobileDevice,
	}) {
		super({
			initialSymbolsIds,
            assets,
            dictionary,
            coefficients,
            isMobileDevice,
		})

		this.initChains(assets)
		this.initWinList(assets)
		this.initInfoBar(assets)

        this.setSourceArea({width: 1145, height: 859})

		const offsetX = 160
		const offsetY = 120

        this.reelsContainer.position.set(offsetX, offsetY)
		this.bigWinView.position.set(
			REELS_WIDTH / 2 + offsetX,
			REELS_HEIGHT / 2 + offsetY)
	}


    initBackground(assets) {
		this.addChildAt(new Sprite(assets.reels_desktop_background), 0)
	}

	initLogo(assets) {
		let view = new Sprite(assets.static_desktop_logo)
		view.position.set(750, 8)
		this.addChild(view)

		view = this.addChild(new SpineView(assets.logo.spineData))
		view.position.set(574, 430)
		view.playAnimation({name: 'idle', isLoopMode: true})

		new Timeline()
            .addAnimation({
                duration: 14000,
                onFinish: () => {
                    view.playAnimation({name: 'idle'})
                },
            })
            .setLoopMode()
            .play();
	}

	initChains(assets) {
		const descriptors = [
			{
				x: 85,
				y: 55,
				rotation: Math.PI / 4 * 5
			},
			{
				isMirrored: true,
				x: 1070,
				y: 70,
				rotation: Math.PI / 4 * 3
			}
			,
			{
				x: 1133,
				y: 835,
				rotation: Math.PI / 4.35
			},

			{
				x: 10,
				y: 835,
				isMirrored: true,
				rotation: -Math.PI / 4.35
			},
		].forEach(({
			isMirrored = false,
			x,
			y,
			rotation
		}) => {
			const view = new Sprite(assets.desktop_chain)
			view.anchor.set(0.1, 0.5)
			view.rotation = rotation
			view.position.set(x, y)
			view.scale.x = isMirrored ? -1 : 1
			this.addChild(view)
		})
	}

	initWinList(assets, isRTL) {
		const view = new InteractiveWinListView({assets, isRTL})
		view.position.set(705, 135)
		this.winListView = this.addChild(view)
	}

	initInfoBar(assets) {
		this.infoBarView = this.addChild(new InfoBarView({assets}))
		this.infoBarView.position.set(400, 60)
	}

	updateTargetArea() {
		this.setTargetArea({x: 0, y: 0.025, width: 1, height: 0.975})
	}

	presentMessage({
        text,
        forcePresent = false,
        color,
    }) {
        this.infoBarView.presentMessage({
			text,
			forcePresent,
			color,
		})
    }
}