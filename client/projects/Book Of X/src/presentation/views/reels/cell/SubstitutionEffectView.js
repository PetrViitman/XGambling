import { Container } from "pixi.js";
import { getLightSpot, getRectangleSpot } from "../../GraphicalPrimitives";

export class SubstitutionEffectView extends Container {
    contentContainer
    glowView
    raysViews

    constructor() {
        super()
        this.initContentContainer()
        this.initGlowView()
        this.initRays()
    }

    initContentContainer() {
        this.contentContainer = this.addChild(new Container)
        this.contentContainer.alpha = 0
        this.contentContainer.scale.set(3)
    }

    initGlowView() {
        const view = getLightSpot({
            radius: 100 
        })

        view.scale.set(0.5)

        this.contentContainer.addChild(view)
    }

    initRays() {
        this.raysViews = new Array(8)
            .fill(0)
            .map((_) => {
                const view = getRectangleSpot({width: 50, height: 5})
                this.contentContainer.addChild(view)

                return view
            })
    }

    present(progress) {
        const floatingProgress = Math.sin(Math.PI * progress)
        this.contentContainer.alpha = floatingProgress
        const beamsIntensity = 1

        this.raysViews.forEach((beamView, i) => {
            const viewProgress = (i * (1 / 8) + progress) % 1;
            const localProgress = viewProgress > 0.5
                ? 1 - (viewProgress - 0.5) * 2
                : viewProgress * 2;

            beamView.scale.set(
                (0.05 + 0.25 * localProgress) * beamsIntensity,
                (0.05 + 0.25 * (1 - localProgress)) * beamsIntensity,
            );
            beamView.rotation = ((i + 1) / 5) * Math.PI * 2 + 0.5 * viewProgress;

            /*
            view.scale.x = i % 2 === 0
                ? 0.5 + 0.5 * distortionProgress
                : 1 - 0.5 * distortionProgress

            view.scale.y = i % 2 === 0
                ? 1 - 0.5 * shiftedProgress
                : 0.5 + 0.5 * shiftedProgress
                */
        })

    }
}