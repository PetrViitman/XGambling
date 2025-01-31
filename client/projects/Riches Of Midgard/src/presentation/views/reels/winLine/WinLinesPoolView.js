import { Container } from "pixi.js";
import { CELL_HEIGHT, CELL_WIDTH } from "../../../Constants";
import { WinLineView } from "./WInLineView";

export class WinLinesPoolView extends Container {
	winLinesViews = []
	resources
	winLinesTopologies

	constructor(resources, winLinesTopologies) {
		super()

		this.resources = resources
		this.winLinesTopologies = winLinesTopologies
	}

	getLine(index) {
		const { winLinesViews } = this

		if(!winLinesViews[index]) {
			winLinesViews[index] = new WinLineView(this.resources)
			this.addChild(winLinesViews[index])
		}

		return winLinesViews[index]
	}

	presentWinLine({
		lineIndex = 0,
		winLineIndex = 0,
		progress = 0
	}) {
		const { winLinesTopologies } = this
		const lineView = this.getLine(lineIndex)
		lineView.position.set(
			CELL_WIDTH + CELL_WIDTH / 2,
			CELL_HEIGHT * winLinesTopologies[winLineIndex][0] + CELL_HEIGHT / 2)
		lineView.adjust(winLineIndex, progress)
	}
}