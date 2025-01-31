import { Container, Graphics } from "pixi.js";
import { CELL_HEIGHT, CELL_WIDTH, REELS_HEIGHT, REELS_WIDTH } from "../../../Constants";
import { WinLineView } from "./WInLineView";
import { Timeline } from "../../../timeline/Timeline";

export class WinLinesPoolView extends Container {
	winLinesViews
	resources
	linesCountProgress = 0
	timeline = new Timeline
	activeLinesCount
	revealProgress
	activityFactor = 1
	winTabloidView
	isWinTopologyDemoInProgress = false

	constructor(resources) {
		super()
		this.resources = resources

		this.initWinLines(resources)

		this.newLinesCount = 0

		this.presentLinesCount(10)
		this.timeline.wind(1)
		this.presentLinesHide()
		this.timeline.wind(1)
	}

	initWinLines(resources) {
		this.winLinesViews = [
			350,
			150,
			550,
			85,
			615,
			280,
			415,
			485,
			215,
			700,
		].map((offsetY, index) => {
			const winLineView = new WinLineView({resources, index})
			winLineView.onTextFieldClick = () => this.onWinLineClick()

			this.addChild(winLineView)

			winLineView.y = offsetY

			return winLineView
		})
	}

	presentLinesCount(
		linesCount = this.activeLinesCount,
		forcePresent = false
	) {
		if(!forcePresent && this.activeLinesCount === linesCount)
			return

		this.activeLinesCount = linesCount
		const offset = this.linesCountProgress % 1
		const delta = 1 - offset

		this.isWinTopologyDemoInProgress = true
		this.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: delta * 300,
				onProgress: progress => {
					const subProgress = offset + delta * progress

					this.linesCountProgress = subProgress
					this.winLinesViews.forEach((view, i) => {
						const { introProgress } = view
						if (i < linesCount) {
							view.presentIntro()
			
							view.presentIntro(Math.max(subProgress, introProgress))
						} else {
							view.presentIntro(Math.min(1 - subProgress, introProgress))
						}
					})
				}
			})
			.addAnimation({
				delay: 5000,
				duration: 200,
				onProgress: progress => {
					this.winLinesViews
						.forEach(view =>
							view.presentBodyHide(progress))
				},
				onFinish: () => {
					this.isWinTopologyDemoInProgress = false
				}
			})
			.play()

	/*
		this.revealProgress = progress
		this.winLinesViews.forEach((view, i) => {
			const { introProgress } = view
			if (i < linesCount) {
				view.presentIntro()

				view.presentIntro(Math.max(progress, introProgress))
			} else {
				view.presentIntro(Math.min(1 - progress, introProgress))
			}
		})
	*/

/*
		for(let i = 0; i < linesCount - 1; i++)
			this.winLinesViews[i].presentIntro(1)
		for(let i = linesCount; i < this.winLinesViews.length; i++)
			this.winLinesViews[i].presentIntro(0)

		this.winLinesViews[linesCount - 1].presentIntro(progress)
		*/
	}

	presentWinLines(indexes = [], progress = 1) {
		this.winLinesViews.forEach((view, i) => {
			if (indexes.includes(i)) {
				view.presentWin(progress)
			} else {
				view.presentBodyHide(Math.min(1, progress * 3))
			}
		})
	}

	presentWinLine(index, progress) {
		this.winLinesViews.forEach((view, i) => {
			if (i === index) {
				view.presentWin(progress)
			} else {
				view.presentBodyHide(Math.min(1, progress * 3))
			}
		})
	}

	presentLinesHide() {
		return this
			.timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 300,
				onProgress: progress => {
					const { winTabloidView } = this

					this.winLinesViews
						.forEach(view =>
							view.presentBodyHide(Math.min(1, progress * 3)))

					if (winTabloidView)
						winTabloidView.alpha = Math.max(winTabloidView.alpha, progress)
				}
			})
			.play()
	}

	setInteractive(isInteractive = true) {
		this.isWinTopologyDemoInProgress = false
		this.winLinesViews.forEach(view => {
			view.setInteractive(isInteractive)
		})
    }

	onWinLineClick() {
		const { winTabloidView, timeline} = this
		if(this.isWinTopologyDemoInProgress) {
			timeline.windToTime(timeline.duration - 750)
			this.isWinTopologyDemoInProgress = false
			return
		}

		this.isWinTopologyDemoInProgress = true

		timeline
			.deleteAllAnimations()
			.addAnimation({
				duration: 750,
				onProgress: progress => {
					for(let i = 0; i < this.activeLinesCount; i++) {
						const view = this.winLinesViews[i]
						view.presentWin(0.5 * Math.min(1, progress * (1 + 0.1 * i)))
					}

					if(winTabloidView)
						winTabloidView.alpha = Math.min(winTabloidView.alpha, 1 - progress)
				}
			})
			.addAnimation({
				delay: timeline.duration,
				duration: 4250,
				onProgress: _ => {
					for(let i = 0; i < this.activeLinesCount; i++) {
						const view = this.winLinesViews[i]
						view.presentWin(0.5)
					}

					if(winTabloidView)
						winTabloidView.alpha = 0
				}
			})
			.addAnimation({
				delay: timeline.duration,
				duration: 750,
				onDelayFinish: () => {
					this.isWinTopologyDemoInProgress = false
				},
				onProgress: progress => {
					for(let i = 0; i < this.activeLinesCount; i++) {
						const view = this.winLinesViews[i]
						view.presentWin(0.5 + 0.5 * Math.min(1, progress * (1 + 0.5 * i)))
					}

					if (winTabloidView)
						winTabloidView.alpha = Math.max(winTabloidView.alpha, progress)
					
				},
			})
			.play()
	}
}