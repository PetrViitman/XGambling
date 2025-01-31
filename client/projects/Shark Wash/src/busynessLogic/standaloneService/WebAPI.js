import { FakeServer } from "./service/FakeServer"
const server = new FakeServer

/**
 * Independent wait for latency imitation
 */
function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}


export const webAPI = {
    gameDescription: async () => {
        // high latency on this initial request makes no sense for this demo anyways 
        await wait(Math.random() * 100)
        return server.getGameDescription()
    },
    makeBet: async ({
        bet,
        buyFeaturePrice,
        desiredReels,
    }) => {
        await wait(Math.random() * 2000)
        
        return server.makeBet({
            bet,
            buyFeaturePrice,
            desiredReels: desiredReels?.map(reel => reel.map(id => id))
        })
    },
}
