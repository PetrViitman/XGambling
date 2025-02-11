import { setFavicon } from "../../Utils";
import { AdaptiveContainer } from "../adaptiveDesign/AdaptiveContainer";
import { IframeCloseButtonView } from "./IframeCloseButtonView";

export class IframeView extends AdaptiveContainer{
    closeButtonView
    iframeHTMLElement

    constructor() {
        super()

        this.initIframeCloseButton()
        this.drop()
    }

    initIframeCloseButton() {
        this.closeButtonView = this.addChild(new IframeCloseButtonView())
        this.closeButtonView.onClick = () => this.drop()
    }

    drop() {
        const url = document.location.host
        setFavicon(url.substring(0, url.lastIndexOf('/')) + '/favicon.png')
        document.title = 'ROUTER'
        this.iframeHTMLElement?.remove()
        this.closeButtonView.setVisible(false)
        this.onDrop?.()
    }

    async presentProject(url, name) {
        this.drop()

        const iframe = document.createElement('iframe');

        iframe.style.width = '100%'
        iframe.style.height = '100%'
        iframe.style.position = 'absolute'
        iframe.style.padding = '0px'
        iframe.style.border = '0px'
        iframe.allowFullscreen = true


        document.body.appendChild(iframe)
        await new Promise(resolve => {
            iframe.addEventListener('load', resolve, true)
            iframe.url = url
            iframe.src = url
        })

        this.iframeHTMLElement = iframe
        this.closeButtonView.setVisible(true)

        setFavicon(url.substring(0, url.lastIndexOf('/')) + '/favicon.png')
        document.title = name

        return new Promise(resolve => {
            this.onDrop = resolve
        })
    }

    refresh() {
        const {iframeHTMLElement} = this
        if(!iframeHTMLElement) return

        iframeHTMLElement.src=''
        iframeHTMLElement.src=iframeHTMLElement.url


    }
}