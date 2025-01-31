import { Container, Sprite } from "pixi.js";
import { brightnessToHexColor } from "../../GraphicalPrimitives";

export class BookOfXView extends Container {
    contentContainer
    flamesContainer
    flamesViews = []
    beltsViews
    bodyView
    pageShadowView
    pageContainer
    pageFacesViews = []
    scrollableContentView
    
    constructor(resources) {
        super()

        this.initContentContainer()
        this.initFlames(resources)
        this.initBelts(resources)
        this.initBody(resources)
        this.initPage(resources)
    }

    initContentContainer() {
        this.contentContainer = this.addChild(new Container)
        this.contentContainer.sortableChildren = true
    }

    initFlames(resources) {
		const container = this.contentContainer.addChild(new Container)
		
		for(let i = 0; i < 4; i++) {
			const sprite = new Sprite(resources.book_light)
			sprite.anchor.set(0.5)
			sprite.scale.set(2, 2.5)
			this.flamesViews.push(container.addChild(sprite))
		}

		this.flamesContainer = container
	}

    initBelts(resources) {
         this.beltsViews = [
            {
                anchorX: 0.85,
                anchorY: 0.85,
                x: -280,
                y: -55,
            },
            {
                anchorX: 0.15,
                anchorY: 0.85,
                x: 285,
                y: -70,
            },
            {
                anchorX: 0.85,
                anchorY: 0.15,
                x: -280,
                y: 100,
            },
            {
                anchorX: 0.15,
                anchorY: 0.15,
                x: 280,
                y: 100,
            },
        ].map(({
            anchorX,
            anchorY,
            x,
            y
        }, i) => {
            const sprite = new Sprite(resources['book_belt_' + i])
            sprite.anchor.set(anchorX, anchorY)
            sprite.position.set(x, y)

            return this.contentContainer.addChild(sprite)
        })
    }

    initBody(resources) {
        const sprite = new Sprite(resources.book_body)
        sprite.anchor.set(0.5)
        this.contentContainer.addChild(sprite)
    }

    initPage(resources) {
        const { contentContainer } = this

        this.pageShadowView = new Sprite(resources.book_page_0)
        this.pageShadowView.tint = 0x000000
        this.pageShadowView.scale.x = -1
        this.pageShadowView.anchor.x = 1
        this.pageShadowView.position.set(-263, -243)
        contentContainer.addChild(this.pageShadowView)

        const pageContainer = contentContainer.addChild(new Container)
        pageContainer.position.set(12, -50)
        this.pageContainer = pageContainer

        const backFaceView  = new Sprite(resources.book_page_0)
        backFaceView.anchor.set(0, 0.5)
        pageContainer.addChild(backFaceView)
        this.pageFacesViews[0] = backFaceView

        const frontFaceView  = new Sprite(resources.book_page_1)
        frontFaceView.anchor.set(0, 0.5)
        pageContainer.addChild(frontFaceView)
        this.pageFacesViews[1] = frontFaceView
        pageContainer.zIndex = 1
    }

    presentFloating(progress) {
        const {
            contentContainer,
            beltsViews,
        } = this


        const wiggleProgress = Math.sin(Math.PI * 6 * progress)
        const subProgress = Math.sin(Math.PI * 2 * progress)
        const rotationProgress = Math.sin(Math.PI * 4 * progress)

        beltsViews[0].rotation = 0.25 * wiggleProgress
        beltsViews[1].rotation = -0.25 * wiggleProgress
        beltsViews[2].rotation = 0.25 * wiggleProgress
        beltsViews[3].rotation = -0.25 * wiggleProgress

        contentContainer.y = 30 * wiggleProgress
        contentContainer.scale.set(1 + 0.05 * subProgress)

        contentContainer.rotation = rotationProgress * 0.02

        
        // FLAME...
        const flameProgress = (progress * 5) % 1
        this.flamesContainer.rotation = -this.contentContainer.rotation
		const progressShiftStep = 1 / (this.flamesViews.length - 1)

		this.flamesViews.forEach((view, i) => {
			view.rotation = this.rotation
			const shiftedProgress = (flameProgress + progressShiftStep * i) % 1
			const subProgress = Math.sin(Math.PI * shiftedProgress)

			view.y = -150 * shiftedProgress ** 2
			view.alpha = subProgress
		})
        // ...FLAME
    }

    presentScrolling({progress = 0}) {
        
        this.pageContainer.x = 12 - 17 * progress
        this.pageContainer.skew.y = -Math.PI * progress
        this.pageContainer.scale.y = 1 - 0.2 * Math.abs(Math.sin(Math.PI * 2 * progress))
        this.pageShadowView.alpha = progress * 0.75

        this.pageFacesViews[0].visible = progress > 0.5
        this.pageFacesViews[1].visible = !this.pageFacesViews[0].visible

        this.pageFacesViews[1].tint = brightnessToHexColor(1 - progress)
    }
}