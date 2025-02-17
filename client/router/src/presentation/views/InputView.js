import { Container } from "pixi.js";
import { TextField } from "./text/TextField";
import { Timeline } from "../timeline/Timeline";
import { CHARACTERS_PER_LINE, FONT_SIZE } from "../Constants";
import { HTMLContainer } from "./adaptiveDesign/HTMLContainer";
import { isTouchScreen } from "../Utils";

const INPUT_MAXIMAL_LENGTH = 30
const PREFIX = '>'

export class InputView extends Container {
    history = []
    text = ''
    textField
    timeline = new Timeline
    pendingResponseTimeline = new Timeline
    onInputSubmitted
    virtualKeyboardFocusElement
    preset
    prefix = ''
    isHidden
    
    constructor() {
        super()
        this.initTextField()
        this.initTimeline()
        this.initPendingResponseTimeline()
        if(isTouchScreen()) {
            this.initVirtualKeyboardFocusElement()
        } else {
            document.addEventListener('keydown', ({key}) => this.onUserInput(key))
        }
    }

    initTextField() {
        const textField = new TextField({isDynamicCharacterSet: true, lineBreakTriggerSymbol: null})
            .setFontName('default')
            .setFontSize(FONT_SIZE)
            .setAlignLeft()
            .setAlignMiddle()
            .setCharactersPerLineCount(CHARACTERS_PER_LINE)

        this.textField = this.addChild(textField)
    }

    initVirtualKeyboardFocusElement() {
        const inputHTMLElement = document.createElement('input')
        inputHTMLElement.style.height = FONT_SIZE + 'px'
        inputHTMLElement.style.width = '500px'
        inputHTMLElement.style.backgroundColor = 'red'
        inputHTMLElement.style.zIndex = 2
        inputHTMLElement.style.opacity = 0
        inputHTMLElement.style.cursor = 'pointer'
        inputHTMLElement.style.outline = 'none'
        inputHTMLElement.oninput = ({data, inputType}) =>  {
            this.onUserInput(data, inputType)
        }
        const container = new HTMLContainer(500, FONT_SIZE)
        container.setHTMLContent(inputHTMLElement)
        container.highlightSourceArea()

        this.addChild(container)
        inputHTMLElement.addEventListener('keypress', ({key}) => key === 'Enter' && this.onUserInput(key))

        this.virtualKeyboardFocusElement = inputHTMLElement
    }

    initTimeline() {
        const {textField} = this

        this.timeline
            .addAnimation({
                duration: 1000,
                onStart: () => {
                    try {
                        document.body.focus()
                    } catch (error) {
                 
                    }
                },
                onProgress: progress => {
                    const isPreset = this.text === '' && this.preset


                    let finalText = isPreset ? this.preset : this.text

                    if(this.isHidden) {
                        let buffer = ''
                        for(let i = 0; i < finalText.length; i++ ){
                            buffer += '*'
                        }

                        finalText = buffer
                    }

                    
                    textField.alpha = (!this.text.length && this.preset)
                        ? 0.6
                        : 1

                    let postFix = (progress > 0.5
                        && this.onInputSubmitted
                        && this.text.length < INPUT_MAXIMAL_LENGTH)
                        ? '_'
                        : ''

                    if(progress > 0.5 && isPreset) {
                        finalText = ''
                        postFix = ''
                    }
                    
                    textField.setText(
                        PREFIX + this.prefix + finalText + postFix
                    )
                }
            })
            .setLoopMode()
    }

    initPendingResponseTimeline() {
        const {textField} = this

        this.pendingResponseTimeline
            .addAnimation({
                duration: 1000,
                onProgress: progress => {
                    const periodsCount = Math.sin(progress * Math.PI) * 5
                    let text = ''

                    for(let i = 0; i < periodsCount; i++) {
                        text += '.'
                    }
                    
                    textField.setText(text)
                }
            })
            .setLoopMode()
    }

    onUserInput(key, type) {
        if(!this.onInputSubmitted) return

        if(this.virtualKeyboardFocusElement) {
            if(!this.virtualKeyboardFocusElement.value.length) {
                this.virtualKeyboardFocusElement.value = '_'
            }
        }

        switch(key) {
            case 'ArrowUp':

                break
            case 'ArrowDown':

                break
            case 'Enter':
                this.onInputSubmitted(this.text.length ? this.text : this.preset)
                this.preset = null
                this.textField.alpha = 1
                this.onInputSubmitted = null
                this.history.push(this.text)
                this.timeline.pause()
                this.textField.setText(PREFIX)
                if (this.virtualKeyboardFocusElement)
                    this.virtualKeyboardFocusElement.disabled = true

                break
            case 'Backspace':
            case null:
                const finalLength = Math.max(0, this.text.length - 1)
                this.text = this.text.substring(0, finalLength)
                break
            default:
                if(
                    (key.length === 1 || type === 'insertText' || type === 'insertFromPaste')
                    && this.text.length < INPUT_MAXIMAL_LENGTH
                ) {
                    this.text += key
                }
                break
        }
    }

    getUserInput({prefix = '', isHidden, preset}) {
        this.setVisible()
        this.isHidden = isHidden
        this.preset = preset
        this.prefix = prefix
        this.pendingResponseTimeline.pause()
        this.text = ''

        if (this.virtualKeyboardFocusElement)
            this.virtualKeyboardFocusElement.disabled = false

        return new Promise(resolve => {
            this.onInputSubmitted = resolve
            this.timeline.play()
        })
    }

    presentPendingResponse() {
        this.pendingResponseTimeline.play()
        this.setVisible()
    }

    setVisible(isVisible = true) {
        this.visible = isVisible

        if (this.virtualKeyboardFocusElement) {
            this.virtualKeyboardFocusElement.disabled = isVisible

            this.virtualKeyboardFocusElement.style.display = isVisible ? 'block' : 'none'
        }
    }
}