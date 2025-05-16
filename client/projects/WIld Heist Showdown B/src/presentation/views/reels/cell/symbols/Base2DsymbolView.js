import { Container, Sprite } from "pixi.js";
import { brightnessToHexColor } from "../../../GraphicalPrimitives";
import { SpineView } from "../../../SpineView"


export class Base2DSymbolView extends Container {

	brightness = 1
	spineView
	

	constructor(id, assets) {
		super()
		const SYMBOLS_ID_NAMES_MAP = {
		1: 'a',
		2: 'k',
		3: 'j',
		4: 'q',
		5: 'bottle',
		6: 'hat',
		7: 'gun',
		8: 'boy',
		9: 'wild',
		10: 'scatter',
		}
		
		const finalName = SYMBOLS_ID_NAMES_MAP[id];
        const spineData = assets[finalName];

        this.initSpine(spineData);
        this.randomizeIdleOffset()
	}

	
	initSpine(spineData) { 
		const spineView = new SpineView(spineData); 
		this.addChild(spineView); 
		this.spineView = spineView; 
	}

	setVisible(isVisible = true) {
		this.visible = isVisible
	}

	setBlur(progress = 0) {
		this.spineView.playAnimation({name: 'blur'})
		this.spineView.wind (progress)
	}


	setSymbolFall(progress = 0){
	this.spineView.playAnimation({name: 'fall'})
	this.spineView.wind (progress)
	}

	setBrightness(brightness = 1) {
		const finalBrightness = Math.min(1, Math.max(0.05, brightness))
		if (this.brightness === finalBrightness) return
		this.brightness = finalBrightness
		this.spineView.setBrightness(finalBrightness)
	}

	// API...
	setSpin(spinProgress) {
	}

	copyMetrics(symbolView) {
		this.setBrightness(symbolView.brightness)
	}

	presentWin(progress) {
		this.spineView.playAnimation({name: 'action'})
		this.spineView.wind (progress)
	}

	presentScatterAnimation (animationName ){
		this.spineView.playAnimation({name: animationName, isLoopMode:true})
	}

	presentWildAnimation (animationName ){
		this.spineView.playAnimation({name: animationName, isLoopMode:false})
	}

	presentCoefficients(progress) {
		this.spineView.playAnimation({name: 'fall'})
		this.spineView.wind (progress)
	}

	presentIdle() {
		this.spineView.playAnimation({name: 'idle', isLoopMode: true})
		this.spineView.wind(0.0001)
	}

    presentTeasing() {
	}

	presentSpecialWin(progress){
		this.spineView.playAnimation({name: 'fall'})
		this.spineView.wind (progress)
	}

    randomizeIdleOffset() {
		this.idleProgressOffset = Math.random()
	}

	reset() {
		this.brightness = 1
	}

	presentCorruption() {
		this.spineView.playAnimation({name: 'action'})
		this.spineView.wind (progress)
    }

	update(progress = this.idleProgress) {
		//this.spineView.playAnimation({name: 'idle', isLoopMode: true})
    }

	isIdling(progres){
		//this.spineView.playAnimation({name: 'idle_fast', isLoopMode: true})
	}
	// ...API
}

