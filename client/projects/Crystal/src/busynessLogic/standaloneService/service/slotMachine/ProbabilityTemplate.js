import {
	REELS_COUNT,
	CELLS_PER_REEL_COUNT,
	REGULAR_SYMBOLS_IDS,
	SYMBOLS_IDS,
	WILD_SYMBOL_ID
} from "./SlotMachine"

const FIRST_REEL_PROBABILITY_PER_CELL = 1 / REGULAR_SYMBOLS_IDS.length
const DEFAULT_REEL_PROBABILITY_PER_CELL = 1 / SYMBOLS_IDS.length

const REGULAR_PROBABILITY = {}
SYMBOLS_IDS.forEach(id => 
	REGULAR_PROBABILITY[id] = new Array(REELS_COUNT)
	.fill(0)
	.map((_, x) => {
		if (x === 0) {
			const probability = id === WILD_SYMBOL_ID ? 0 : FIRST_REEL_PROBABILITY_PER_CELL
			return new Array(CELLS_PER_REEL_COUNT).fill(probability)
		}

		return new Array(CELLS_PER_REEL_COUNT).fill(DEFAULT_REEL_PROBABILITY_PER_CELL)
	}
))


function checkTemplate(ids = SYMBOLS_IDS) {	
	for (let x = 0; x < REELS_COUNT; x++) {
		for (let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
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

export default structuredClone(REGULAR_PROBABILITY)