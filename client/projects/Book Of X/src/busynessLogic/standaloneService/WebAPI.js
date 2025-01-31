import { FakeServer } from "./service/FakeServer"
const server = new FakeServer

/**
 * Independent wait for latency imitation
 */
function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function printRequest({request = {}, name = ''}) {
    console.log(name + ' REQUEST:', request);
}

function printResponse({response = {}, name = ''}) {
    console.log(name + ' RESPONSE:', response);
}


export const webAPI = {
    
    gameDescription: async () => {
        const name = 'GAME DESCRIPTION'
        printRequest({name})
        // high latency on this initial request makes no sense for this demo anyways 
        await wait(Math.random() * 100)

        const response = server.getGameDescription()
        printResponse({name, response})

        return response
    },
    makeBet: async ({
        betPerLine,
        linesCount,
        desiredReels,
        riskOption,
        specialSymbolId
    }) => {
        const name = 'MAKE BET'
        printRequest({name, request: {
            betPerLine,
            linesCount,
            desiredReels: desiredReels?.map(reel => reel.map(id => id)),
            riskOption,
            specialSymbolId
        }})

        await wait(Math.random() * 2000)

        const response = server.makeBet({
            betPerLine,
            linesCount,
            desiredReels: desiredReels?.map(reel => reel.map(id => id)),
            riskOption,
            specialSymbolId
        })

        printResponse({name, response})
    
        return response
    },

    makeRisk: async (option) => {
        const name = 'RISK'
        printRequest({name, request: {
            option,
        }})

        await wait(Math.random() * 2000)

        const response = server.makeRisk(option)
        printResponse({name, response})

        return response
    }
}