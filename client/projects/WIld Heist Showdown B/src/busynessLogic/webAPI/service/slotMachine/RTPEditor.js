import PROBABILITY from "./ProbabilityTemplate"
import { SlotMachine } from "./SlotMachine"


/*
const MINIMAL_PROBABILITY_MAP = [
    [0.045 * MULTIPLIER, 0.045 * MULTIPLIER, 0.045 * MULTIPLIER],
    [0.035 * MULTIPLIER, 0.03 * MULTIPLIER, 0.03 * MULTIPLIER, 0.035],
    [0.025 * MULTIPLIER, 0.02 * MULTIPLIER, 0.02 * MULTIPLIER, 0.02 * MULTIPLIER, 0.025 * MULTIPLIER],
    [0.025 * MULTIPLIER, 0.02 * MULTIPLIER, 0.02 * MULTIPLIER, 0.02 * MULTIPLIER, 0.025 * MULTIPLIER],
    [0.035 * MULTIPLIER, 0.03 * MULTIPLIER, 0.03 * MULTIPLIER, 0.035 * MULTIPLIER],
    [0.04 * MULTIPLIER, 0.04 * MULTIPLIER, 0.04 * MULTIPLIER],
]
*/
/*
const MINIMAL_PROBABILITY_MAP = [
    [0.0625, 0.0625, 0.0625],
    [0.045, 0.04, 0.04, 0.045],
    [0.045, 0.03, 0.02, 0.03, 0.045],
    [0.045, 0.03, 0.02, 0.03, 0.045],
    [0.045, 0.035, 0.035, 0.045],
    [0.045, 0.045, 0.045 ],
]
*/


/*
// LOW SYMBOLS...
const MINIMAL_PROBABILITY_MAP = [
    [0.04, 0.0425, 0.04],
    [0.035, 0.04, 0.04, 0.04],
    [0.04, 0.04, 0.04, 0.04, 0.04],
    [0.03, 0.03, 0.03, 0.03, 0.03],
    [0.03, 0.03, 0.03, 0.03],
    [0.035, 0.035, 0.035 ],
]
// ...LOW SYMBOLS
*/

/*
const MINIMAL_PROBABILITY_MAP = [
    [0.05, 0.05, 0.05],
    [0.04, 0.0375, 0.0375, 0.04],
    [0.035, 0.035, 0.025, 0.035, 0.035],
    [0.035, 0.035, 0.025, 0.035, 0.035],
    [0.03, 0.03, 0.03, 0.03],
    [0.04, 0.04, 0.04 ],
]
*/
const M = 0.045

const MINIMAL_PROBABILITY_MAP = {
	defaultGame: [
		[0.05, 0.05, 0.05],
		[0.04, 0.04, 0.04, 0.04],
		[0.03, 0.03, 0.03, 0.03, 0.03],
		[0.03, 0.03, 0.03, 0.03, 0.03],
		[0.04, 0.04, 0.04, 0.04],
		[0.05, 0.05, 0.05 ],
	],
	bonusGame: [
		[0.045 * M, 0.015  , 0.045 * M],
		[0.035 * M, 0.035 * M, 0.035 * M, 0.015],
		[0.03 * M, 0.03 * M, 0.03 * M, 0.03 * M, 0.0125],
		[0.03 * M, 0.03 * M, 0.03 * M, 0.03 * M, 0.03 * M],
		[0.035 * M, 0.035 * M, 0.04 * M, 0.04 * M],
		[0.05 * M, 0.05 * M, 0.05 * M ],
	],
}



// DEBUG...
function print(reels, caption = '___') {
	let text = caption
	for(let y = 0; y < reels[1].length; y++) {
		text += '\n|'
		for(let x = 0; x < reels.length; x++) {
			const symbolId = (reels[x][y] ?? ' ') + ''

			text += ' ' + symbolId + (symbolId.length === 1 ? ' |' : '|')
		}
	}

	console.log(text)
}
// ...DEBUG

/*
const NO_WIN_TEMPLATE = [
    [1, 7, 8],
    [3, 5, 4, 6],
    [4, 2, 2, 1, 1],
    [6, 3, 7, 2, 8],
    [3, 5, 1, 6],
    [4, 7, 2],
]
*/

/*
const NO_WIN_TEMPLATE = [
    [1, 5, 1],
    [2, 6, 2, 6],
    [3, 7, 4, 7, 1],
    [2, 8, 4, 8, 2],
    [1, 5, 1, 5],
    [2, 6, 2],
]
*/

/*
const NO_WIN_TEMPLATE = [
    [1, 2, 1],
    [3, 4, 3, 4],
    [1, 2, 1, 2, 1],
    [3, 4, 3, 4, 3],
    [2, 1, 2, 1],
    [4, 3, 4],
]*/


// LOW SYMBOLS...
/*
const NO_WIN_TEMPLATE = [
    [1, 1, 1],
    [1, 2, 2, 2],
    [1, 3, 2, 4, 4],
    [1, 2, 4, 3, 1],
    [1, 1, 2, 3],
    [1, 1, 1],
]
*/
// ...LOW SYMBOLS

/*
const NO_WIN_TEMPLATE = [
    [1, 2, 2],
    [6, 7, 3, 4],
    [1, 2, 5, 6, 5],
    [3, 4, 7, 8, 3],
    [1, 2, 5, 1],
    [7, 8, 4],
]
*/
const NO_WIN_TEMPLATES = {
	defaultGame: [
		[7, 1, 4],
		[3, 6, 7, 1],
		[3, 5, 8, 2, 2],
		[7, 8, 4, 8, 1],
		[2, 1, 2, 7],
		[6, 7, 4],
	],
	bonusGame: [
		[6, 1, 7],
		[3, 2, 3, 1],
		[2, 4, 8, 4, 1],
		[6, 8, 2, 8, 5],
		[5, 3, 3, 7],
		[6, 7, 4],
	]
}

/*
const NO_WIN_TEMPLATE = [
    [1, 3, 1],
    [2, 4, 2, 4],
    [3, 1, 3, 1, 3],
    [4, 2, 4, 2, 4],
    [1, 3, 1, 3],
    [4, 2, 4],
]
*/

export class RTPEditor {
	slotMachine
	probabilityTargets
	
	constructor() {
		this.slotMachine = new SlotMachine(PROBABILITY)
	}


	addProbabilityToPosition({
		isFreeSpinsMode,
		additionalProbability,
		symbolId,
		x,
		y
	}) {
		const {
			slotMachine,
			slotMachine: {
				regularSymbolsIds,
			}
		} = this

		const probability = isFreeSpinsMode
			? slotMachine.probability.bonusGame
			: slotMachine.probability.defaultGame

		const { regularSymbolsProbability } = probability

		const remainingSymbolsCount = regularSymbolsIds.length - 1
		const probabilityCompensation = -additionalProbability / remainingSymbolsCount
		const minimalProbabilityMap = isFreeSpinsMode
			? MINIMAL_PROBABILITY_MAP.bonusGame
			: MINIMAL_PROBABILITY_MAP.defaultGame

		regularSymbolsIds.forEach(id => {
			if (id === symbolId) {
				regularSymbolsProbability[id][x][y] += additionalProbability
			} else {
				const downgradedProbability = regularSymbolsProbability[id][x][y] + probabilityCompensation
				if (downgradedProbability < minimalProbabilityMap[x][y]) {
					regularSymbolsProbability[symbolId][x][y] += probabilityCompensation
				} else {
					regularSymbolsProbability[id][x][y] = downgradedProbability
				}
			}
		})
	}

	/*
	addProbability(ids, targets, additionalProbability) {
		const target = targets[Math.trunc(Math.random() * targets.length)]
		const symbolId = ids[Math.trunc(Math.random() * ids.length)]
		this.addProbabilityToPosition({
			additionalProbability,
			symbolId,
			x: target.x,
			y: target.y
		})
	}*/

	adjustProbability(targetRTP = 0.97) {

		const targets = {
			defaultGame: {},
			bonusGame: {}
		}

        NO_WIN_TEMPLATES.defaultGame.forEach((reel, x) => reel.forEach((symbolId, y) => {
            if(!targets.defaultGame[symbolId]) targets.defaultGame[symbolId] = []
            targets.defaultGame[symbolId].push({x, y})
        }))

		NO_WIN_TEMPLATES.bonusGame.forEach((reel, x) => reel.forEach((symbolId, y) => {
			if(!targets.bonusGame[symbolId]) targets.bonusGame[symbolId] = []
            targets.bonusGame[symbolId].push({x, y})
        }))


		const {
			slotMachine: {
				probability,
				regularSymbolsIds,
			}
		} = this

        for(let i = 0; i < 500; i++) {
			// DEFAULT GAME...
            let ids = [1, 2, 3, 4, 5, 6, 7, 8].forEach(regularSymbolId => {
                const finalTargets = targets.defaultGame[regularSymbolId]
                finalTargets.forEach(({x, y}) => {
                    this.addProbabilityToPosition({
						isFreeSpinsMode: false,
						additionalProbability: 0.01,
						symbolId: regularSymbolId,
						x,
						y
					})
                })
            })
			// ...DEFAULT GAME
			// BONUS GAME...
			ids = [1, 2, 3, 4, 5, 6, 7, 8].forEach(regularSymbolId => {
                const finalTargets = targets.bonusGame[regularSymbolId]
                finalTargets.forEach(({x, y}) => {
                    this.addProbabilityToPosition({
						isFreeSpinsMode: true,
						additionalProbability: 0.01,
						symbolId: regularSymbolId,
						x,
						y
					})
                })
            })
			// ...BONUS GAME
        }


        /*
        for(let i = 0; i < 100; i++) {
            lowValueIds.forEach(lowSymbolId => {
               //  if (i % 100 === 0) console.log((i / 1_000).toFixed(2))
                const targets = lowWinSymbolsTargets[lowSymbolId]
                targets.forEach(({x, y}) => {
                    this.addProbabilityToPosition(0.01, lowSymbolId, x, y)
                })
            })
        }
        */
        console.log('calculating RTP...')

        console.log('RTP = ', this.getRTP(100_000))
        // console.log('RTP = ', this.getRTP(5_000_000))
		console.log('DESCRIPTOR: ', probability)
		console.log('STATS: ', this.slotMachine.statistics)
		console.log('STATS: ', this.slotMachine.statistics.defaultGame)

        return probability

		// const probabilityDeltaPerStep = 0.0025
		const probabilityDeltaPerStep = 0.01
		let iterationsCount = 0
		let rtp = Infinity
	

		while(
			(rtp > targetRTP)
			&& (iterationsCount < 100_000)
		) {
			iterationsCount++
			let itc
			if(rtp > 3)
				itc = 1_000
			else
				itc = 10_000


			rtp = this.getRTP(itc)

			if(rtp <= targetRTP)
				rtp = this.getRTP(1_000_000)

			if(rtp <= targetRTP)
				rtp = this.getRTP(10_000_000)

			if(rtp <= targetRTP) 
				break

			const randomSymbolId = regularSymbolsIds[Math.trunc(regularSymbolsIds.length * Math.random())]
            const targets = noWinSymbolsTargets[randomSymbolId]
            const {x, y} = targets[Math.trunc(targets.length * Math.random())]
            this.addProbabilityToPosition(probabilityDeltaPerStep, randomSymbolId, x, y)

			console.log('rtp:', rtp.toFixed(3))

			// symbolIdIndex = (symbolIdIndex + 1) % ids.length
		}
	
		console.log('RTP = ', this.getRTP(10_000_000))
		console.log('DESCRIPTOR: ', probability)

		// this.isProbabilityValid()
	}

	getRTPWithComments(rollsCount = 1000_000_000, breakPointRollsCount = 100_000) {
		const { slotMachine } = this
		const probabilityDeltaPerStepsCount = Math.ceil(rollsCount / breakPointRollsCount)
		
		let totalWinCoefficient = 0
		let rollIndex = 0
	
		for(let i = 0; i < probabilityDeltaPerStepsCount; i++) {
			console.log((rollIndex / rollsCount * 100).toFixed(0) + '%', 'rtp = ' + (totalWinCoefficient / (rollIndex + 1)))
			for(let j = 0; j < breakPointRollsCount; j++) {
				const { totalCoefficient } = slotMachine.generateSingleGameDescriptor({})
				rollIndex++
				totalWinCoefficient += totalCoefficient
				if (rollIndex > rollsCount) break
			}
	
		}
		console.log('100%')
		console.log('RTP: ', totalWinCoefficient / rollsCount)
	
		return totalWinCoefficient / rollsCount
	}
	
	getRTP(rollsCount = 1000) {
		const { slotMachine } = this
		let totalWinCoefficient = 0
	
		for (let i = 0; i < rollsCount; i++) {
			totalWinCoefficient += slotMachine.generateSingleGameDescriptor({}).totalCoefficient
		}
	
		return totalWinCoefficient / rollsCount
	}

	printProbabilitySummCheck() {	
		const {
			slotMachine: {
				regularSymbolsIds,
			}
		} = this
	
		const probabilities = [this.slotMachine.probability.defaultGame, this.slotMachine.probability.bonusGame]

		probabilities.forEach(({regularSymbolsProbability}) => {
			for (let x = 0; x < 5; x++) {
				for (let y = 0; y < [3, 4, 5, 5, 4, 3][x]; y++) {
					let commonProbability = 0
					regularSymbolsIds.forEach(id => {
						commonProbability += regularSymbolsProbability[id]?.[x]?.[y] ?? 0
					})
		
					if (Number(commonProbability.toFixed(3)) !== 1) {
						console.error('%cPROBABILITY IS INVALID AT x: ' + x + ' y: ' + y + ': ' + commonProbability.toFixed(2), 'background: #FF0000; color: #FFF')
					} else {
						console.log('%cPROBABILITY IS VALID AT x: ' + x + ' y: ' + y + ': ' + commonProbability.toFixed(2), 'background: #00FF00; color: #FFF')
					}
				}
			}
		})
	}

	printProbability() {
		const {
			slotMachine
		} = this

		const probabilities = [slotMachine.probability.defaultGame, slotMachine.probability.bonusGame]

		probabilities.forEach(({regularSymbolsProbability}) => {
			let reelIndex = 0
			for (const [id, reels] of Object.entries(regularSymbolsProbability)) {
				const tableObject = {}

				reels[2]?.forEach((_, y) => {
					const row = {}

					reels?.forEach((value, x) => {
						row['reel #' + x] = Number(value[y]?.toFixed(6))
					})

					tableObject['row #' + y] = row
				})

				reelIndex++

				console.log('id: ', id)
				console.table(tableObject);
			}
		})
	}

	/*

	{ // 1000 launches x 10000 spins
		"failedSimulationsCount": 152,
		"successfulSimulationsCount": 848,
		"lowestRTP": 0.8517949999999439,
		"highestRTP": 1.2685099999999148,
		"vulnerability": 0.152
	}
	{ // 1000 launches x 25000 spins
		"failedSimulationsCount": 60,
		"successfulSimulationsCount": 940,
		"lowestRTP": 0.8962700000000783,
		"highestRTP": 1.1617580000002303,
		"vulnerability": 0.06
	}
	{ // 1000 launches x 50000 spins
		"failedSimulationsCount": 24,
		"successfulSimulationsCount": 976,
		"lowestRTP": 0.9146160000003349,
		"highestRTP": 1.066937000000444,
		"vulnerability": 0.024
	}
	{ // 1000 launches x 100000 spins
		"failedSimulationsCount": 11,
		"successfulSimulationsCount": 989,
		"lowestRTP": 0.9217539999996756,
		"highestRTP": 1.0396179999996449,
		"vulnerability": 0.011
	}
	{ // 1000 launches x 200000 spins
		"failedSimulationsCount": 2,
		"successfulSimulationsCount": 998,
		"lowestRTP": 0.9343549999986102,
		"highestRTP": 1.0022107499985335,
		"vulnerability": 0.002
	}
	{ // 1000 launches x 500000 spins
		"failedSimulationsCount": 0,
		"successfulSimulationsCount": 1000,
		"lowestRTP": 0.9452615000028606,
		"highestRTP": 0.9802023000030948,
		"vulnerability": 0
	}
	*/

	simulateLaunches({
		simulationsCount = 100,
		spinsCount = 10_000,
		probability = PROBABILITY
	}) {
		this.slotMachine.probability = probability
		let failedSimulationsCount = 0
		let successfulSimulationsCount = 0
		let lowestRTP = 1
		let highestRTP = 0

		for (let i = 0 ; i < simulationsCount; i++) {
			this.slotMachine.dropStatistics()

			this.getRTP(spinsCount)

			console.log((i / simulationsCount).toFixed(2) + ' RTP: ', this.slotMachine.statistics.common.rtp)

			if (this.slotMachine.statistics.common.rtp > highestRTP) {
				highestRTP = this.slotMachine.statistics.common.rtp
			}

			if (this.slotMachine.statistics.common.rtp < lowestRTP) {
				lowestRTP = this.slotMachine.statistics.common.rtp
			}

			if (this.slotMachine.statistics.common.rtp < 1) {
				successfulSimulationsCount++ 
			} else {
				failedSimulationsCount++ 
			}
		}

		console.log({
			failedSimulationsCount,
			successfulSimulationsCount,
			lowestRTP,
			highestRTP,
			vulnerability: failedSimulationsCount / simulationsCount
		})
	}
}