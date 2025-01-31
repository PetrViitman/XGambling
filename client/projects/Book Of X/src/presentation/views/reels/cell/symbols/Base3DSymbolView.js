import { BLEND_MODES, Container, Sprite } from "pixi.js";
import { brightenColor, brightnessToHexColor, toHexColor } from "../../../GraphicalPrimitives";

export class Base3DSymbolView extends Container {
	flipProgress = 0.0001
	spinProgress = 0

	presentationFlipProgress = 0
	presentationSpinProgress = 0

	idleProgressOffset = Math.random()
	idleFactor = 1
	flameIntensity = 1

	flamesContainer
	flamesViews = []
	contentContainer
	contentWrapperContainer
	facesViews = []
	distances = []
	angles = []
	brightness = 1
	flameProgress = 0
	glowingFaceView
	resources

	constructor(resources, ) {
		super()
		this.resources = resources
		this.initContentContainers()

		this.initFlames()
		this.initFaces(resources)
		this.initGlowingFace()
		this.setFlip()

		/*
		new Timeline()
			.addAnimation({
				duration: 10000,
				onProgress: progress => {
					this.setFloating(progress)
				}
			})
			.setLoopMode()
			.play()
		*/
	}

	initContentContainers(contentScaleFactor = 0.8) {
		this.contentWrapperContainer = this.addChild(new Container)
		this.contentWrapperContainer.scale.set(contentScaleFactor)
		this.contentWrapperContainer.scale.set(contentScaleFactor)
		this.contentContainer = this
			.contentWrapperContainer
			.addChild(new Container)
	}

	initFlames(texture, scaleFactor = 1) {
		const container = this.contentContainer.addChild(new Container)
		
		for(let i = 0; i < 4; i++) {
			const sprite = new Sprite(texture)
			sprite.anchor.set(0.5)
			sprite.scale.set(2.1)
			this.flamesViews.push(container.addChild(sprite))
		}

		this.flamesContainer = container
	}

	initFaces(resources) {
		const {
			contentContainer,
			facesViews,
			distances,
			angles,
		} = this
	}

	initGlowingFace(textureName = 'symbol_10', distance = 16) {
		const sprite = new Sprite(this.resources[textureName])

		this.glowingFaceView = sprite
		sprite.alpha = 0
		sprite.blendMode = BLEND_MODES.ADD
		sprite.anchor.set(0.5)
		this.contentContainer.addChild(sprite)

		this.angles.push(-Math.PI)
		this.distances.push(distance)
		this.facesViews.push(sprite)
	}

	setVisible(isVisible = true) {
		this.visible = isVisible
	}

	setBlur() {

	}

	setBrightness(brightness = 1) {
		const finalBrightness = Math.min(1, Math.max(0.05, brightness))

		if (this.brightness === finalBrightness) return
		this.brightness = finalBrightness

		this.adjustBrightness()
	}
	
	setFlip(flipProgress = 0) {
		if (this.flipProgress === flipProgress) return
		this.flipProgress = flipProgress

		const {
			contentContainer,
			facesViews,
			distances,
			angles,
			flameIntensity,
		} = this

		const progress = Math.cos(Math.PI * 2 * flipProgress)
		const offsetProgress = Math.sin(Math.PI * 2 * flipProgress)

		this.flamesContainer.scale.set(
			(0.5 + 0.5 * Math.abs(progress)) * flameIntensity,
			flameIntensity
		)

		for(let i = 0; i < facesViews.length; i++) {
			const angle = (angles[i] ?? 0) + Math.PI * 2 * flipProgress
			const progress = Math.cos(angle)


			const faceView = facesViews[i]
			const distance = distances[i] ?? 100
			const offsetProgress = Math.sin(angle)

			faceView.visible = (progress >= 0 && progress <= 1)

			if(faceView.visible) {
				faceView.scale.x = progress
				faceView.x = offsetProgress * distance
				faceView.flipProgress = progress
			}
		}

		this.adjustBrightness()

		const distortionProgress = Math.sin(Math.PI * 4 * flipProgress)
		contentContainer.x = 15 * distortionProgress
		contentContainer.skew.x = -0.05 * distortionProgress
		contentContainer.scale.set(0.95 + 0.05  * distortionProgress)

		this.onFlipped(progress, offsetProgress)
	}

	onFlipped(progress, offsetProgress) {

	}

	setSpin(spinProgress) {
		if (this.spinProgress === spinProgress) return
		this.spinProgress = spinProgress
		const angle = Math.PI * 2 * spinProgress
		this.contentContainer.rotation = angle
		this.flamesContainer.rotation = -angle

		this.flamesViews.forEach(view => view.rotation = angle)
	}

	adjustBrightness() {
		this.facesViews.forEach(view => {
			view.tint = brightnessToHexColor(
				Math.max(0.25, Math.abs(view.flipProgress ?? 0)) * this.brightness)
		})

		this.flamesContainer.alpha = this.brightness
	}

	adjustFlame() {
		this.flamesContainer.rotation = -this.contentContainer.rotation
		const progressShiftStep = 1 / (this.flamesViews.length - 1)

		this.flamesViews.forEach((view, i) => {
			view.rotation = this.rotation
			const shiftedProgress = (this.flameProgress + this.idleProgressOffset + progressShiftStep * i) % 1

			const subProgress = Math.sin(Math.PI * shiftedProgress)

			view.y = -60 * shiftedProgress + 10//  ** 2
			view.x = 10 * Math.sin(Math.PI * 3 * shiftedProgress) * (1 - shiftedProgress)
			view.alpha = subProgress  * (1 - shiftedProgress)
			// view.scale.set(1 - 0.1 * shiftedProgress)
		})
	}

	setFloating(floatingProgress = 0) {
		const finalProgress = (floatingProgress + this.idleProgressOffset) % 1

		this.setFlip(0.065 * Math.cos(Math.PI * 4 * finalProgress))
		this.flameProgress = (finalProgress * 10) % 1
		this.adjustFlame()
		this.setSpin(0.015 * Math.sin(Math.PI * 4 * finalProgress))
	}

	copyMetrics(symbolView) {
		this.setFlip(symbolView.flipProgress)
		this.setSpin(symbolView.spinProgress)
		this.setBrightness(symbolView.brightness)
	}

	setLockedBrightness(brightness) {
		this.lockedBrightness = brightness
	}

	update(progress) {
		this.adjustFlame(progress)

		// FLIP...
		const idleFlipProgress =
			0.065
			* this.idleFactor
			* Math.cos(
				Math.PI * 2 * (
					progress
					+ this.idleProgressOffset
				)
			)

		const finalFlipProgress = (
				idleFlipProgress
				+ this.presentationFlipProgress
			) % 1
		
		this.setFlip(finalFlipProgress)
		// ...FLIP

		// SPIN...
		const idleSpinProgress =
			0.015
			* this.idleFactor
			* Math.cos(
				Math.PI * 2 * (
					progress
					+ this.idleProgressOffset
				)
			)

		const finalSpinProgress = (
				idleSpinProgress
				+ this.presentationSpinProgress
			) % 1
		
		this.setSpin(finalSpinProgress)
		// ...SPIN

		// FLAME...
		this.flameProgress = (progress * 5) % 1
		this.adjustFlame()
		// ...FLAME
	}

	presentWin(progress) {
		const subProgress = Math.sin(Math.PI * progress)

		// this.flameIntensity = 1 + 0.25 * subProgress
		this.scale.set(1 + 0.15 * subProgress)
		this.idleFactor = 1 - subProgress
		this.presentationFlipProgress = subProgress * 0.5
		this.contentContainer.y = -25 * subProgress

		const glowProgress = Math.abs(Math.sin(Math.PI * 2 * progress))

		this.glowingFaceView.alpha = Math.min(1, glowProgress * 2)
	}

	presentBookWin(progress) {
		const subProgress = Math.sin(Math.PI * progress)

		this.flameIntensity = 1 + 0.25 * subProgress
		this.scale.set(1 + 0.15 * subProgress)
		this.idleFactor = 1 - subProgress
		this.presentationFlipProgress = 0.5 - subProgress * 0.5
		this.contentContainer.y = -25 * subProgress

		const glowProgress = Math.abs(Math.sin(Math.PI * 2 * progress))

		this.glowingFaceView.alpha = Math.min(1, glowProgress * 2)
	}

	presentDemo(progress) {
		const subProgress = Math.sin(Math.PI / 2 * progress)
		// this.flameIntensity = 1 + 0.1 * subProgress
		this.presentationSpinProgress = 0
		this.presentationFlipProgress = progress * 0.5
		this.scale.set(1)
		this.contentContainer.y = 0

	}

	reset() {
		this.presentationFlipProgress = 0
		this.presentationSpinProgress = 0
		this.brightness = 1
		this.flameIntensity = 1
		this.idleFactor = 1
	}
}