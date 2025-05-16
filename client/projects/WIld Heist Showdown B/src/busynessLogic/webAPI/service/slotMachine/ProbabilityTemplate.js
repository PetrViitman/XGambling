import {
	REELS_COUNT,
	REELS_LENGTHS,
	REGULAR_SYMBOLS_IDS,
} from "./SlotMachine"


function structuredClone(object) {
	return JSON.parse(JSON.stringify(object))
}

const REGULAR_PROBABILITY_PER_CELL = 1 / REGULAR_SYMBOLS_IDS.length
const REGULAR_PROBABILITY = {}
REGULAR_SYMBOLS_IDS.forEach(id => 
	REGULAR_PROBABILITY[id] = new Array(REELS_COUNT)
	.fill(0)
	.map((_, x) => new Array(REELS_LENGTHS[x])
	.fill(REGULAR_PROBABILITY_PER_CELL)))


function checkTemplate(ids = REGULAR_SYMBOLS_IDS) {	
	for (let x = 0; x < REELS_COUNT; x++) {
		for (let y = 0; y < REELS_LENGTHS[x]; y++) {
			let commonProbability = 0
			ids.forEach(id => {
				commonProbability += REGULAR_PROBABILITY[id][x][y]
			})

			if (Number(commonProbability.toFixed(3)) === 1) {
				console.log('TEMPLATE IS VALID AT x: ' + x + ' y: ' + y, commonProbability.toFixed(3))
			} else {
				console.error('TEMPLATE IS INVALID AT x: ' + x + ' y: ' + y, commonProbability.toFixed(3))
			}
		}
	}
}
 
// checkTemplate()

export default {
	defaultGame: {
		regularSymbolsProbability: structuredClone(REGULAR_PROBABILITY),
		specialSymbolsProbability: {
			wild: [0, 0.03, 0.03, 0.03, 0.03, 0.03],
			scatter: [0.05, 0.05, 0.05, 0.05, 0.05, 0.05],
			goldenFrames: [
				[0.4, 0.5, 0.5, 0.5, 0.4],
				[0.4, 0.5, 0.5, 0.5, 0.4]		
			]
		},
	},
	bonusGame: {
		regularSymbolsProbability: structuredClone(REGULAR_PROBABILITY),
		specialSymbolsProbability: {
			wild: [0, 0.005, 0.005, 0.005, 0.005, 0.005],
			scatter: [0.005, 0.01, 0.01, 0.01, 0.005, 0.01],
			goldenFrames: [
				[0.075, 0.1, 0.125, 0.1, 0.075],
				[0.075, 0.1, 0.125, 0.1, 0.075]
			]
		},
	}
}