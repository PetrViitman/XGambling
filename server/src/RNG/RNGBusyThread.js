const {parentPort} = require('worker_threads');


const generateTwoRandomDigits = (duration = 10) => {
    const timestamp = Date.now()
    
    let elapsedCallsCount = 0
    while(Date.now() - timestamp < duration) {
        elapsedCallsCount++
    }

    const elapsedCallsCountString = elapsedCallsCount + ''
    const twoFinalDigits = elapsedCallsCountString
        .substring(
            elapsedCallsCountString.length - 2,
            elapsedCallsCountString.length
        )

    return twoFinalDigits
}


const getRandomNumber = (decimalPlacesCount = 1) => {
    let text = ''
    const generationsCount = Math.max(1, decimalPlacesCount / 2)
    for(let i = 0; i < generationsCount; i++) {
        text += generateTwoRandomDigits()
    }

    return Number(
        '0.' + text.substring(
            0,
            Math.max(1, decimalPlacesCount))
        )
}


let interval
const keepGeneratingRandomNumbers = async () => {
    const randomNumber = getRandomNumber(5)
    parentPort.postMessage(randomNumber)
}

parentPort.on('message', isGenerationRequired => {
    if (isGenerationRequired) {
        if (interval) return
        interval = setInterval(keepGeneratingRandomNumbers, 1)
    } else {
        clearInterval(interval)
        interval = null
    }
})