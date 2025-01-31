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
        bet,
        desiredReels
    }) => {
        const name = 'MAKE BET'
        printRequest({name, request: {
            bet,
            desiredReels
        }})

        await wait(Math.random() * 2000)

        const response = server.makeBet({
            bet,
            desiredReels: desiredReels?.map(reel => reel.map(id => id)),
        })

        printResponse({name, response})


        return response
    },
}