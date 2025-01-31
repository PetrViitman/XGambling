const {
	REELS_WIDTH,
	REELS_HEIGHT,
	REGULAR_SYMBOLS_IDS,
} = require("../CorsairsGoldSlotMachine")

const REGULAR_PROBABILITY_PER_CELL = 1 / REGULAR_SYMBOLS_IDS.length
const REGULAR_PROBABILITY = {}
REGULAR_SYMBOLS_IDS.forEach(id => 
	REGULAR_PROBABILITY[id] = new Array(REELS_WIDTH)
	.fill(0)
	.map(_ => new Array(REELS_HEIGHT)
	.fill(REGULAR_PROBABILITY_PER_CELL)))

	const WILD_SUBSTITUTION_PROBABILITY = [0, 0.09, 0.08, 0.07, 0.06, 0.05]
	const SCATTER_SUBSTITUTION_PROBABILITY = [0.1, 0.09, 0.08, 0.07, 0.06, 0.05]


function checkTemplate(ids = REGULAR_SYMBOLS_IDS) {	
	for (let x = 0; x < REELS_WIDTH; x++) {
		for (let y = 0; y < REELS_HEIGHT; y++) {
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

module.exports = {
	regularSymbolsProbability: REGULAR_PROBABILITY,
	specialSymbolsProbability: {
		defaultGame: {
			wild: WILD_SUBSTITUTION_PROBABILITY,
			scatter: SCATTER_SUBSTITUTION_PROBABILITY,
		},
		bonusGame: {
			wild: WILD_SUBSTITUTION_PROBABILITY,
			scatter: SCATTER_SUBSTITUTION_PROBABILITY,
		}
	},
}