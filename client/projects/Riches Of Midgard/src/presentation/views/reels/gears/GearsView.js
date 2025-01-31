import { Container } from "pixi.js";
import { Timeline } from "../../../timeline/Timeline";
import { GearView } from "./GearView";

const DESCRIPTORS = [

	{
		flip: 0.475,
		spinOffset: 0,
		scale: 1.5,
		angle: 0,
		x: 880,
		y: 925,
		acceleration: 1.5,
	},
	{
		flip: 0.25,
		spinOffset: 0,
		scale: 2.25,
		angle: 0.1,
		x: 830,
		y: 800,
	},
	{
		flip: 0.5,
		spinOffset: 0,
		scale: 1.25,
		angle: 0,
		x: 25,
		y: 925,
		isMirrored: true,
		acceleration: 1.75,
	},
	{
		flip: 0.31,
		spinOffset: 0,
		scale: 1.75,
		angle: -0.05,
		x: 85,
		y: 850,
		isMirrored: true,
	}
]


export class GearsView extends Container {
	gearsViews
	timeline = new Timeline
	accelerationTimeline = new Timeline

	constructor(resources) {
		super()

		this.gearsViews = DESCRIPTORS.map(({
			flip = 0.41,
			spinOffset = 0,
			scale = 1,
			angle = 0,
			x = 0,
			y = 0,
			isMirrored = false
		}) => {
			const gearView = this.addChild(new GearView(resources))

			gearView.setSpin(spinOffset)
			gearView.setFlip(flip)
			gearView.scale.set(scale)
			gearView.position.set(x, y)
			gearView.rotation = angle
			if (isMirrored)
				gearView.scale.x *= -1

			return gearView
		})


		this.timeline = new Timeline()
            .addAnimation({
                duration: 5000,
                onProgress: (progress) => {

					this.gearsViews.forEach((view, i) => {
						const {
							angle,
							flip,
						} = DESCRIPTORS[i]

						const shiftedProgress = (progress + i * 0.2) % 1
						const subProgress = Math.abs(Math.sin(Math.PI * 3 * shiftedProgress))

						view.setSpin(i % 2 === 0 ? progress : 1 - progress)
						view.rotation = angle + 0.1 * subProgress
						view.setFlip(flip + subProgress * 0.05)
					})
                }
            })
            .setLoopMode()
		this.timeline.play()

		this.pause()
	}

	play() {
		this.accelerationTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 500,
				onProgress: progress => 
					this.timeline.setTimeScaleFactor({value: 0.25 + 1.75 * progress})
			})
			.play()
	}

	pause() {
		this.accelerationTimeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 500,
				onProgress: progress => 
					this.timeline.setTimeScaleFactor({value: 2 - 1.75 * progress})
			})
			.play()
	}
	
}