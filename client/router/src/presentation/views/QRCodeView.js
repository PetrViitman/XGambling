import QRCode from 'qrcode'
import { Sprite, BaseTexture, Texture, Container } from "pixi.js"


export class QRCodeView extends Container {
    codeView

    constructor(url = 'https://google.com', width = 150, height = 150) {
        super()
    
        const canvas = document.createElement('canvas')
        QRCode.toCanvas(canvas, url, {
            width: width * 2,
            height: height * 2,
            quality: 1,
            margin: 1,
            color: {
                dark:"#000",
                light:"#99FF00"
            }
        })

        const baseTexture = new BaseTexture(canvas)
        const texture = new Texture(baseTexture)
        const sprite = new Sprite(texture)
        sprite.scale.set(0.5)

        this.codeView = this.addChild(sprite)
    }
}