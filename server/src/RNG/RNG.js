const RANDOM_NUMBERS_BUFFER_TARGET_LENGTH = 10000
const BUSY_CPUS_COUNT = 15
const {Worker} = require('worker_threads')
const randomNumbers = []
const threads = new Array(BUSY_CPUS_COUNT)
    .fill(0)
    .map(() => {
        const thread = new Worker('./src/RNG/RNGBusyThread.js')
        thread.on('message', (randomNumber) => onNewRandomNumberGenerated(randomNumber))

        return thread
    })

const toggleRandomNumbersGeneration = (isRequired = true) => {
    threads.forEach(thread => thread.postMessage(isRequired))
}

const onNewRandomNumberGenerated = (randomNumber) => {
    if (randomNumberPendingResolution) {
        randomNumberPendingResolution(randomNumber)
        randomNumberPendingResolution = null
    } else {
        randomNumbers.push(randomNumber)
        if(randomNumbers.length >= RANDOM_NUMBERS_BUFFER_TARGET_LENGTH) {
            toggleRandomNumbersGeneration(false)
        }
    }
}

let randomNumberPendingResolution

const random = async () => {
    if (randomNumbers.length < RANDOM_NUMBERS_BUFFER_TARGET_LENGTH) {
        toggleRandomNumbersGeneration(true)
    }
    
    if (randomNumbers.length) {
        return randomNumbers.pop()
    }

    return new Promise(resolve => {
        randomNumberPendingResolution = resolve
    })
}


async function testRandomSpread(spreadLength = 10, numbersCount = 10) {
    const randomNumbers = []


    for(let i = 0; i < spreadLength; i++) {
        randomNumbers[i] = 0
    }

    for(let i = 0; i < numbersCount; i++) {
        const randomNumber = await random()
        console.log('%', i / numbersCount)
        randomNumbers[Math.trunc(randomNumber * spreadLength)] ++
    }


    randomNumbers.forEach(number => {
        console.log(number)
    })

    console.log(randomNumbers)
}

// testRandomSpread()
toggleRandomNumbersGeneration(true)

module.exports = random