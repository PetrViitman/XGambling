
import { BLEND_MODES, Container, Filter, Sprite } from "pixi.js";
import { TextField } from "../../text/TextField";

const DESCRIPTORS = [
	{ // 0
		color: 0x22CCFF,
		textColor: 0xFF7755,
		angle: 0,
		maskIndex: 0,
		lineX: 0,
		lineY: -20,
		secondLabelOffsetY: 0,
	},
	{ // 1
		color: 0xFF5522,
		textColor: 0xFFCC44,
		angle: 0.05,
		maskIndex: 0,
		lineX: 0,
		lineY: -20,
		secondLabelOffsetY: 0,
	},
	{ // 2
		color: 0xCCFF00,
		textColor: 0xFF8800,
		angle: 0,
		maskIndex: 0,
		lineX: 0,
		lineY: -20,
		secondLabelOffsetY: 0,
	},
	{ // 3
		color: 0xFFFF00,
		textColor: 0x444444,
		angle:0.2,
		maskIndex: 3,
		lineX: 0,
		lineY: -20,
		secondLabelOffsetY: 0,
		secondLabelAngle: -0.1,
	},
	{ // 4
		color: 0xFF99FF,
		textColor: 0xFFFFFF,
		angle: -0.1,
		maskIndex: 3,
		lineX: 0,
		lineY: 15,
		secondLabelOffsetY: 0,
		secondLabelAngle: 0.2,
		isMirrored: true
	},
	{ // 5
		color: 0x33FF00,
		textColor: 0x444444,
		angle:0,
		maskIndex: 5,
		lineX: 0,
		lineY: -20,
		secondLabelOffsetY: 0,
		secondLabelAngle: 0,
	},
	{ // 6
		color: 0xFF9999,
		textColor: 0xFFFFFF,
		angle:-0.1,
		maskIndex: 5,
		lineX: 0,
		lineY: 20,
		secondLabelOffsetY: 0,
		secondLabelAngle: 0,
		isMirrored: true
	},
	{ // 7
		color: 0x99CCFF,
		textColor: 0xFF7755,
		angle:0.1,
		maskIndex: 7,
		lineX: 0,
		lineY: -430,
		secondLabelOffsetY: -275,
		secondLabelAngle: 0.1,
	},
	{ // 8
		color: 0xFF9922,
		textColor: 0xFFFFFF,
		angle:0,
		maskIndex: 7,
		lineX: 0,
		lineY: 440,
		secondLabelOffsetY: 270,
		secondLabelAngle: -0.1,
		isMirrored: true
	},
	{ // 9
		color: 0x6666FF,
		textColor: 0xFFBB00,
		angle:-0.1,
		maskIndex: 9,
		lineX: 0,
		lineY: -720,
		secondLabelOffsetY: -685,
		secondLabelAngle: -0.23,
		lineAngle: 0.025
	},
]


export class WinLineView extends Container {
	lineContainer
	bodyView
	textFields = []

	introProgress = 0
	revealProgress
	winProgress = 0

	onTextFieldClick

	constructor({
		resources,
		index = 0,
	}) {
		super()

		this.initLine(resources, index)
		this.initLabels(resources, index)
	}

	initLine(resources, index) {
		const {
			color,
			maskIndex,
			lineY,
			isMirrored,
			lineAngle = 0,
		} = DESCRIPTORS[index]

		const container = this.addChild(new Container)
		container.position.set(
			85,
			lineY,
		)
		container.scale.set(1.01)
		if(isMirrored)container.scale.y *= -1


		const maskView = new Sprite(resources['line_mask_' + maskIndex])
		container.mask = maskView
		maskView.rotation = lineAngle
		container.addChild(maskView)

		const bodyView = new Sprite(resources.waves)
		bodyView.tint = color
		bodyView.x = -500
		bodyView.width = maskView.width * 2
		bodyView.height = maskView.height
		this.bodyView = container.addChild(bodyView)

		const filter = new Filter()
		filter.blendMode = BLEND_MODES.ADD
		container.filters = [filter]
		this.lineContainer = container
	}

	initLabels(resources, index) {

		const {
			color,
			textColor,
			angle,
			secondLabelOffsetY = 0,
			secondLabelAngle = angle
		} = DESCRIPTORS[index]

		const offsets = [50, 1370].forEach((x, i) => {
			// BACKGROUND...
			const container = this.addChild(new Container)
			container.rotation = !!i ? -angle : angle
			container.x = x

			let sprite = new Sprite(resources.line_text_field_frame)
			sprite.anchor.set(0.5)
			container.addChild(sprite)
			sprite.scale.x = i % 2 ? -1 : 1


			sprite = new Sprite(resources.line_text_field)
			sprite.anchor.set(0.5)
			sprite.tint = color
			container.addChild(sprite)
			// ...BACKGROUND

			// TEXT FIELD...
			const maximalWidth = 60
			const maximalHeight = 40
			const textField = container
				.addChild(new TextField({
					maximalWidth,
					maximalHeight
				}))
				.setFontName('egypt')
				.setFontSize(100)
				.setText((index + 1) + '')
				.setAlignCenter()
				.setAlignMiddle()
				.setFontColor(textColor)

			textField.pivot.set(maximalWidth / 2, maximalHeight / 2)

			if(i) {
				container.position.set(x, secondLabelOffsetY)
				container.rotation = secondLabelAngle
			}

			container.cacheAsBitmap = true
			container.on(
				'pointerdown',
				() => this.onTextFieldClick?.())

			this.textFields.push(container)
			// ...TEXT FIELD
		})
	}

	presentIntro(progress) {
		this.introProgress = progress
		this.textFields.forEach(view => {
			view.alpha = Math.min(1, progress * 2)
			view.scale.set(progress ** 2)
		})
		this.bodyView.x = -3500 + 3000 * progress
		this.lineContainer.alpha = progress
	}

	presentOutro(progress) {
		this.textFields.forEach(view => {
			view.alpha = 1 - Math.min(1, progress * 2)
			view.scale.set(1 - progress ** 2)
		})
		this.bodyView.x = -500 + 3000 * progress
		this.lineContainer.alpha = 1 - progress
	}

	presentWin(progress) {
		this.winProgress = progress
		this.bodyView.x = -3800 + 6000 * progress
		
		this.lineContainer.alpha = Math.sin(Math.PI * progress)
	}

	presentBodyHide(progress) {
		const { lineContainer } = this
		lineContainer.alpha = Math.min(lineContainer.alpha, 1 - progress)
	}

	presentBodyReveal(progress) {
		const { lineContainer } = this
		lineContainer.alpha = Math.max(lineContainer.alpha, progress)
	}

	setInteractive(isInteractive = true) {
        const eventMode = isInteractive ? 'static' : 'none'
        const cursor = isInteractive ? 'pointer' : 'default'

		this.textFields.forEach(view => {
			view.eventMode = eventMode
			view.cursor = cursor
		})
    }
}