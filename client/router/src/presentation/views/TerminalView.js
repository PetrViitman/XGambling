import { CHARACTERS_PER_LINE, DEFAULT_FONT_COLOR, FONT_SIZE } from "../Constants";
import { AdaptiveContainer } from "./adaptiveDesign/AdaptiveContainer";
import { InputView } from "./InputView";
import { QRCodeView } from "./QRCodeView";
import { TextField } from "./text/TextField";

const MESSAGES_SPACING = 10

export class TerminalView extends AdaptiveContainer {
    qrCodes = []
    textFields = []
    inputView


    constructor() {
        super()

        this.initInput()
    }

    initInput() {
        this.inputView = this.addChild(new InputView())
    }

    getTextField(index) {
        if(!this.textFields[index]) {
    
            const textField = new TextField({
                isDynamicCharacterSet: true,
                lineBreakTriggerSymbol: null
            })
                .setFontName('default')
                .setFontSize(FONT_SIZE)
                .setAlignLeft()
                .setAlignMiddle()
                .setCharactersPerLineCount(CHARACTERS_PER_LINE)
    
            this.addChild(textField)
            this.textFields.push(textField)
        }

        return this.textFields[index]
    }

    updateTargetArea(sidesRatio) {
        this.setSourceArea({width: 500, height: 500})
            .setTargetArea({x: 0, y: 0, width: 1, height: 1})
            .stickLeft()
            .stickTop()
    }

    async presentMessages(
        messages = [
            {text: 'hello!', color: 0xFFFFFF, highlight: 0xFF00FF, onClick: () => {console.log('click!')}},
            {text: 'welcome to terminal 123466666666666666 test123 456 yarrr!', highlight: 0x0000FF},
            {qrCode: {url: 'https://google.com'}}
        ]
    ) {
        let offsetY = MESSAGES_SPACING
        let textFieldIndex = 0

        this.qrCodes.forEach(view => view.destroy())

        messages.forEach(message => {
            const text = typeof message === 'string'
                ? message
                : message.text


            if (text) {
                const textField = this.getTextField(textFieldIndex)
                textField.visible = true
                
                textField
                    .setText(text)
                    .setFontColor(message.color ?? DEFAULT_FONT_COLOR)
                    .highlightArea(message.highlight ?? 0x000000, 1)
                

                textField.y = offsetY
                offsetY += textField.height + MESSAGES_SPACING


                const {onClick} = message
                textField.eventMode = onClick ? 'static' : 'none'
                textField.cursor = onClick ? 'pointer' : 'default'

                textField.off('pointerdown', textField.onClick)

                if(onClick) {
                    textField.on('pointerdown', onClick)
                    textField.onClick = onClick
                }

                textFieldIndex++
            }

            if(message.qrCode) {
                const view = this.addChild(new QRCodeView(message.qrCode.url))
                message.view = view
                view.y = offsetY
                offsetY += view.height + MESSAGES_SPACING
                this.qrCodes.push(view)
            }
        })

        for(let i = textFieldIndex; i < this.textFields.length; i++) {
            this.textFields[i].visible = false
            this.textFields[i].y = -10000
        }

        this.inputView.y = offsetY

        this.inputView.onInputSubmitted = (userInput) => {
 
        }
    }

    presentPendingResponse() {
        this.inputView.presentPendingResponse()
    }

    getUserInput({prefix, isHidden, preset}) {
        return this.inputView.getUserInput({prefix, isHidden, preset})
    }

    setInputVisible(isVisible = true) {
        this.inputView.setVisible(isVisible)
    }
}