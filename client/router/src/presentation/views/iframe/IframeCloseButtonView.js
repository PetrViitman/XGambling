import {AdaptiveProxyHTMLContainer} from '../adaptiveDesign/AdaptiveProxyHTMLContainer'

export class IframeCloseButtonView extends AdaptiveProxyHTMLContainer {
    htmlElement
    
    constructor() {
        super()

        this.initHTMLElement()
    }

    initHTMLElement() {
        const div = document.createElement('img')
        
        div.style.width = '100px'
        div.style.height = '100px'
        div.style.backgroundColor = 'black'
        div.style.zIndex = 10000
        div.style.fontSize = '75px'
        div.style.borderRadius = '5px'
        div.style.textAlign = 'center'
        div.style.cursor = 'pointer'
        
        div.src = '../../../favicon.png'
        div.addEventListener('pointerdown', () => {
            this.onClick?.()
        })
        document.body.appendChild(div)

        this.htmlElement = div

        this.attach({name: 'home', element: div, offsetX: 10, offsetY: 60})

        this.setTargetArea({x: 0, y: 0, width: 1, height: 1})
            .setSourceArea({width: 1000, height: 1000})
            .stickTop()
            .stickLeft()
    }

    updateTargetArea(sidesRatio) {
        if (sidesRatio > 1) {
            this.setSourceArea({width: 1800, height: 1000})
                .translateElement({ name: 'home', x: 60, y: 60 })
                .stickLeft()
        } else {
            this.setSourceArea({width: 1000, height: 1800})
                .translateElement({ name: 'home', x: 840, y: 60 })
                .stickRight()
        }
    }

    setVisible(isVisible = true) {
        this.htmlElement.style.display = isVisible ? 'block' : 'none'
    }
}