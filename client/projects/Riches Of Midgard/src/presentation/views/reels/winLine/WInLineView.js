
import { Container, Sprite } from "pixi.js";

const LINE_TYPE = {
	HORIZONTAL: 0,
	CURVE_UP: 1,
	CURVE_DOWN: 2,
	DIAGONAL_UP: 3,
	DIAGONAL_DOWN: 4
}

const LINE_TYPES = [
	// -
	LINE_TYPE.HORIZONTAL,
	LINE_TYPE.HORIZONTAL,
	LINE_TYPE.HORIZONTAL,
	LINE_TYPE.HORIZONTAL,
	LINE_TYPE.HORIZONTAL,
	LINE_TYPE.HORIZONTAL,
	LINE_TYPE.HORIZONTAL,
	// \
	LINE_TYPE.DIAGONAL_DOWN,
	LINE_TYPE.DIAGONAL_DOWN,
	LINE_TYPE.DIAGONAL_DOWN,
	LINE_TYPE.DIAGONAL_DOWN,
	LINE_TYPE.DIAGONAL_DOWN,
	// /
	LINE_TYPE.DIAGONAL_UP,
	LINE_TYPE.DIAGONAL_UP,
	LINE_TYPE.DIAGONAL_UP,
	LINE_TYPE.DIAGONAL_UP,
	LINE_TYPE.DIAGONAL_UP,
	// -_-
	LINE_TYPE.CURVE_DOWN,
	LINE_TYPE.CURVE_DOWN,
	LINE_TYPE.CURVE_DOWN,
	LINE_TYPE.CURVE_DOWN,
	LINE_TYPE.CURVE_DOWN,
	LINE_TYPE.CURVE_DOWN,
	// _-_
	LINE_TYPE.CURVE_UP,
	LINE_TYPE.CURVE_UP,
	LINE_TYPE.CURVE_UP,
	LINE_TYPE.CURVE_UP,
	LINE_TYPE.CURVE_UP,
	LINE_TYPE.CURVE_UP,
]

export class WinLineView extends Container {
	contentContainer
	fragmentsViews = []
	resources
	adjustmentMa

	constructor(resources) {
		super()

		this.resources = resources
		this.initAdjustmentMap()
		this.contentContainer = this.addChild(new Container)
		
	}

	initAdjustmentMap() {
		const map = {}

		map[LINE_TYPE.HORIZONTAL] = progress => this.adjustHorizontalLine(progress)
		map[LINE_TYPE.DIAGONAL_DOWN] = progress => this.adjustDiagonalDownLine(progress)
		map[LINE_TYPE.DIAGONAL_UP] = progress => this.adjustDiagonalUpLine(progress)
		map[LINE_TYPE.CURVE_DOWN] = progress => this.adjustCurveDownLine(progress)
		map[LINE_TYPE.CURVE_UP] = progress => this.adjustCurveUpLine(progress)

		this.adjustmentMap = map
	}

	getFragment(index) {
		const { fragmentsViews } = this
		
		if (!fragmentsViews[index]) {
			const name = index % 2 === 0 ? 'chain_fragment_0' : 'chain_fragment_1'

			const sprite = new Sprite(this.resources[name])
			sprite.anchor.set(0.5)
			fragmentsViews[index] = this.contentContainer.addChild(sprite)	
		}

		return fragmentsViews[index]
	}

	adjustHorizontalLine(progress) {
		this.contentContainer.position.set(-120, 0)
		this.contentContainer.rotation = 0
		this.contentContainer.scale.set(1)
		for(let i = 0; i < 20; i++) {
			const subProgress = (progress + 0.05 * i) % 1

			const view = this.getFragment(i)
			view.x = 600 * subProgress
			view.y = 0
			view.visible = true

			const fadeProgress = Math.abs(Math.sin(Math.PI * subProgress))
			view.scale.set(0.45 + (1 - fadeProgress) * 0.1, 0.3 + 0.2 * fadeProgress)
			view.alpha = Math.min(1, fadeProgress * 5)
			view.rotation = -0.1 + 0.2 * fadeProgress * subProgress
		}
	}

	adjustCurveUpLine(progress) {
		this.adjustCurveDownLine(progress)
		this.contentContainer.scale.y = -1
		this.contentContainer.y = 65

	}

	adjustCurveDownLine(progress) {
		this.contentContainer.position.set(-120, -75)
		this.contentContainer.rotation = 0
		this.contentContainer.scale.set(1)
		for(let i = 0; i < 20; i++) {
			const subProgress = (progress + 0.05 * i) % 1

			const view = this.getFragment(i)
			view.x = 600 * subProgress
			view.y = 200 * Math.sin(Math.PI * subProgress )
			view.visible = true

			const fadeProgress = Math.abs(Math.sin(Math.PI * subProgress))
			view.scale.set(0.45 + (1 - fadeProgress) * 0.1, 0.3 + 0.2 * fadeProgress)
			view.alpha = Math.min(1, fadeProgress * 5)
			view.rotation = 1 - subProgress * 1 * 2
		}
	}

	adjustDiagonalUpLine(progress) {
		this.adjustHorizontalLine(progress)
		this.contentContainer.rotation = -0.65
		this.contentContainer.position.set(-70, 60)
	}

	adjustDiagonalDownLine(progress) {
		this.adjustHorizontalLine(progress)
		this.contentContainer.rotation = 0.65
		this.contentContainer.position.set(-65, -65)
	}

	adjust(lineIndex = 0, progress = 0, alpha) {
		const { contentContainer } = this

		this.adjustmentMap[LINE_TYPES[lineIndex]]?.(progress)

		if(alpha) {
			contentContainer.alpha = alpha
			return
		}

		if (progress < 0.2) {
			contentContainer.alpha = progress / 0.2
		} else if (progress > 0.8) {
			contentContainer.alpha = 1 - (progress - 0.8) / 0.2
		} else {
			contentContainer.alpha = 1
		}
	}
}