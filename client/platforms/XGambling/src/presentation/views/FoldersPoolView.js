import { Container } from "pixi.js";
import { FolderView } from "./3DViews/FolderView";
import { AdaptiveContainer } from "./adaptiveDesign/AdaptiveContainer";
import { Timeline } from "../timeline/Timeline";

export class FoldersPoolView extends AdaptiveContainer {
    assets
    foldersContainer
    foldersViews = []
    fadeTimeline = new Timeline
    idleProgress = 0

    constructor(assets) {
        super()

        this.assets = assets

        this.foldersContainer = this.addChild(new Container)
        this.resetFolders()
        this.initTimelines()
    }

    resetFolders(projects = [], resolve) {
        this.foldersViews.forEach(view => view.destroy())
        this.foldersViews = projects.map((project) => {
            const view = new FolderView(
                this.assets, 
                {
                    ...project,
                    colors: [
                        { red: 255, green: 200, blue: 0 },
                        { red: 255, green: 255, blue: 0 },
                    ]
                }
            )

            view.onClick = resolve

            return this.foldersContainer.addChild(view)
        })

        this.refreshDisksLayout()

        this.setVisible()

        this.presentIdle()
    }

    setVisible(isVisible = true) {
        return this
            .fadeTimeline
            .deleteAllAnimations()
            .addAnimation({
                duration: 500,
                onProgress: isVisible
                    ? progress => this.alpha = progress
                    : progress => this.alpha = 1 - progress
            })
            .windToTime(1)
            .play()
    }

    refreshDisksLayout(width, height) {
        const {foldersViews} = this
        const disksCount =  foldersViews.length
        const diskWidth = 250
        const disksPerWidthCount = Math.trunc(width / diskWidth)
        const disksPerHeightCount = Math.trunc(height / diskWidth)
        const rowsCount = Math.ceil(disksCount / disksPerWidthCount)
        const offsetY = (disksPerHeightCount - rowsCount) * 0.5

        let diskIndex = 0

        for (let y = 0; y < rowsCount + 1; y++) {
            const delta = disksCount - y * disksPerWidthCount
            const offsetX = delta < disksPerWidthCount
                ? (disksPerWidthCount - delta) / 2
                : 0

            for (let x = 0; x < disksPerWidthCount; x++) {
                if(diskIndex < disksCount) {
                    foldersViews[diskIndex].position.set(
                        (x + offsetX + 0.5) * 250,
                        (y + offsetY + 0.5) * 250
                    )
                    foldersViews[diskIndex].scale.set(0.4)
                    diskIndex++
                }
            }
        }
    }

    initTimelines() {
        new Timeline()
            .addAnimation({
                duration: 5000,
                onProgress: progress => this.presentIdle(progress)
            })
            .setLoopMode()
            .play()
    }

    presentIdle(progress = this.idleProgress) {
        this.idleProgress = progress
        this.foldersViews.forEach((view, i) => {
            const shiftedProgress = (progress + i * 0.2) % 1
            
            view.setFlip(Math.sin(Math.PI * 2 * shiftedProgress) * 0.5)
        })

        const glowProgress = (progress * 5) % 1

        this.foldersViews.forEach((view, i) => {
            const shiftedProgress = (glowProgress + i * 0.2) % 1
            
            view.presentGlow(shiftedProgress)
        })
    }

    updateTargetArea(sidesRatio) {
        if (sidesRatio > 1.3) {
            this.setSourceArea({width: 1750, height: 500})
                .setTargetArea({x: 0, y: 0.2, width: 1, height: 0.6})
        
            this.refreshDisksLayout(
                this.sourceArea.width,
                500
            )
        } else if (sidesRatio > 1) {
            this.setSourceArea({width: 1250, height: 750})
                .setTargetArea({x: 0, y: 0.2, width: 1, height: 0.6})
            this.refreshDisksLayout(
                this.sourceArea.width,
                750
            )
        } else {
            this.setSourceArea({width: 500, height: 750})
                .setTargetArea({x: 0, y: 0.275, width: 1, height: 0.55})
            this.refreshDisksLayout(
                this.sourceArea.width,
                750
            )
        }
    }
}