const random = require("../../../RNG/RNG")

const MINIMAL_REGULAR_REEL_LENGTH = 3
const MAXIMAL_REGULAR_REEL_LENGTH = 7
const REELS_LENGTHS = [
	1,
	MAXIMAL_REGULAR_REEL_LENGTH,
	MAXIMAL_REGULAR_REEL_LENGTH,
	MAXIMAL_REGULAR_REEL_LENGTH,
	1
]
const LOW_VALUE_IDS = [
	1, // 10
	2, // J
	3, // Q
	4, // K
	5, // A
]
const HIGH_VALUE_IDS = [
	6, // MEAT
	7, // HORN
	8, // FEMALE
	9, // VIKING
	10, // WAR CHIEF
]

const EMPTY_SYMBOL_ID = 0
const SCATTER_SYMBOL_ID = 11
const WILD_SYMBOL_ID = 12

const SPECIAL_SYMBOLS_IDS = [SCATTER_SYMBOL_ID, WILD_SYMBOL_ID]
const REGULAR_SYMBOLS_IDS = [...LOW_VALUE_IDS, ...HIGH_VALUE_IDS]
const HOT_SYMBOLS_IDS = [EMPTY_SYMBOL_ID, ...HIGH_VALUE_IDS]

const REGULAR_REELS_SYMBOLS_IDS = [
	HOT_SYMBOLS_IDS,
	REGULAR_SYMBOLS_IDS,
	REGULAR_SYMBOLS_IDS,
	REGULAR_SYMBOLS_IDS,
	HOT_SYMBOLS_IDS,
]

const SYMBOLS_IDS = [0, ...REGULAR_SYMBOLS_IDS, ...SPECIAL_SYMBOLS_IDS]
const COEFFICIENTS = {
	1: {3: 0.4}, // 10
	2: {3: 0.5}, // J
	3: {3: 0.6}, // Q
	4: {3: 0.7}, // K
	5: {3: 0.8}, // A
	6: {2: 0.5, 3: 1.0}, // MEAT
	7: {2: 1.0, 3: 2.0}, // HORN
	8: {2: 1.5, 3: 3.0}, // FEMALE
	9: {2: 2.0, 3: 7.0}, // VIKING
	10:{2: 5.0, 3: 15.}, // WAR CHIEF
}

const WIN_LINES = [
	// -
	[0, 0, 0],
	[1, 1, 1],
	[2, 2, 2],
	[3, 3, 3],
	[4, 4, 4],
	[5, 5, 5],
	[6, 6, 6],
	// \
	[0, 1, 2],
	[1, 2, 3],
	[2, 3, 4],
	[3, 4, 5],
	[4, 5, 6],
	// /
	[2, 1, 0],
	[3, 2, 1],
	[4, 3, 2],
	[5, 4, 3],
	[6, 5, 4],
	// -_-
	[0, 1, 0],
	[1, 2, 1],
	[2, 3, 2],
	[3, 4, 3],
	[4, 5, 4],
	[5, 6, 5],
	// _-_
	[1, 0, 1],
	[2, 1, 2],
	[3, 2, 3],
	[4, 3, 4],
	[5, 4, 5],
	[6, 5, 6],
]

class SlotMachine {
	probability = []
	reels = REELS_LENGTHS.map(length => new Array(length).fill(0))
	lowValueIds = LOW_VALUE_IDS
	highValueIds = HIGH_VALUE_IDS
	regularSymbolsIds = REGULAR_REELS_SYMBOLS_IDS
	specialSymbolsIds = SPECIAL_SYMBOLS_IDS
	regularWidth = 3
	regularHeight = 7

	constructor(probability) {
		this.probability = probability
	}

	async roll({
		lockedReelsIndexes = [],
		regularReelSize = 3,
		isFreeSpinsMode = false,
		desiredReels,
	}) {
		const {
			reels,
			probability: {
				regularProbability,
				specialSubstituteProbability,
			}
		} = this

		if (desiredReels) {
			reels.forEach((reel, x) => reel.forEach((_, y) =>
				reel[y] = desiredReels[x][y] ?? 0))

			return reels
		}
		

		for (let x = 0; x < reels.length; x++) {
			const reel = reels[x]
			const isLocked = lockedReelsIndexes.includes(x)
			for (let y = 0; y < reel.length; y++) {
				const symbolsIds = REGULAR_REELS_SYMBOLS_IDS[x]
				const randomNumber = await random()
				let probabilityOffset = 0

				// REGULAR SYMBOLS...
				if (y >= regularReelSize) {
					reel[y] = 0
				} else if (isLocked) {
					reel[y] = reels[4][0]
				} else for (let i = 0; i < symbolsIds.length; i++) {
					const id = symbolsIds[i]
					const symbolProbability = probabilityOffset + regularProbability[id][x][y]	
					if (
						regularProbability[id][x][y]
						&& randomNumber <= symbolProbability
					) {
						reel[y] = id
						break
					}
		
					probabilityOffset = symbolProbability
				}
				// ...REGULAR SYMBOLS
			}

			// SPECIAL SUBSTITUTE...
			// SCATTER...
			const scatterProbability = isFreeSpinsMode
				? specialSubstituteProbability.SCATTER.FREE_SPINS
				: specialSubstituteProbability.SCATTER.REGULAR_GAME

			let randomNumber = await random()
			if (!isLocked && randomNumber< scatterProbability[x]) {
				randomNumber = await random()
				reel[Math.trunc(randomNumber * regularReelSize)] = SCATTER_SYMBOL_ID
			}
			// ...SCATTER

			// WILD...
			const wildProbability = (isFreeSpinsMode && !x)
				? specialSubstituteProbability.WILD
				: 0
			
			randomNumber = await random()
			if (!isLocked && randomNumber < wildProbability) {
				randomNumber = await random()
				reel[Math.trunc(randomNumber * regularReelSize)] = WILD_SYMBOL_ID
			}
			// ...WILD
			// ...SPECIAL SUBSTITUTE
		}

		return reels
	}

	getWinLines(reels = this.reels, bet = 1) {
		const winLines = []
		WIN_LINES.forEach((map, lineIndex) => {
			let matchingSymbolId = reels[1][map[0]]
			let matchesCount = 1

			for(let i = 1; i < map.length; i++) {
				const symbolId = reels[i + 1][map[i]]

				if (!symbolId) {
					matchesCount = -1
				} else if ( symbolId !== matchingSymbolId) {
					break
				}

				matchesCount++
			}

			const coefficient = COEFFICIENTS[matchingSymbolId]?.[matchesCount]
			coefficient && winLines.push({
				lineIndex,
				coefficient,
				payout: Number((coefficient * bet).toFixed(2)),
				symbolId: matchingSymbolId,
			})
		})

		return winLines
	}

	async generateSingleGameDescriptor({
		bet = 1,
		isBonusPurchased,
		desiredReels,
	}) {
		let roundSteps = []
		let lockedReelsIndexes = []
		let isFreeSpinsMode = false
		let freeSpinsCount = 0
		let totalCoefficient = 0
		let regularReelSize = MINIMAL_REGULAR_REEL_LENGTH

		do {
			// respin does not count down free spins
			if (!lockedReelsIndexes.length) {
				freeSpinsCount = Math.max(0, freeSpinsCount - 1)
			}
		
			const step = {}
			const reels = await this.roll({
				lockedReelsIndexes,
				regularReelSize,
				isFreeSpinsMode,
				desiredReels
			})
	
			let totalStepCoefficient = 0
			const winLines = this.getWinLines(reels, bet)
			winLines.forEach(({coefficient}) => {
				totalCoefficient += coefficient
				totalStepCoefficient += coefficient
			})

			if (totalStepCoefficient) {
				step.winLines = winLines
				step.stepCoefficient = totalStepCoefficient
				step.stepPayout = Number((totalStepCoefficient * bet).toFixed(2))
			}

			// PURCHASED BONUS PATCH...
			if (
				!roundSteps.length
				&& isBonusPurchased
			) {
				for(let i = 1; i <= 3; i++) {
					if (reels[i].includes(SCATTER_SYMBOL_ID)) continue
					const randomNumber = await random()
					const cellIndex = Math.trunc(randomNumber * MINIMAL_REGULAR_REEL_LENGTH)
					reels[i][cellIndex] = SCATTER_SYMBOL_ID
				}
			}
			// ...PURCHASED BONUS PATCH

			step.reels = reels.map(reel => {
				const finalReel = []
				for (let y = 0; (y < regularReelSize && y < reel.length); y++)
					finalReel[y] = reel[y]

				return finalReel
			})

			// FREE SPINS DETECTION...
			if (freeSpinsCount)
				step.freeSpinsCount = freeSpinsCount

			let scattersCount = 0
			for(const reel of reels)
				for(const symbolId of reel)
					if(symbolId === SCATTER_SYMBOL_ID)
						scattersCount++
			
			let awardedFreeSpinsCount = 0
			if(isFreeSpinsMode) {
				step.freeSpinsCount = freeSpinsCount
				if (scattersCount) {
					regularReelSize = Math.min(7, regularReelSize + 1)
					awardedFreeSpinsCount = 2
					step.expandedReelsLength = regularReelSize
				}
			} else if (scattersCount >= 3) {
				awardedFreeSpinsCount = 8
				isFreeSpinsMode = true
			}

			if(awardedFreeSpinsCount) {
				freeSpinsCount += awardedFreeSpinsCount
				step.awardedFreeSpinsCount = awardedFreeSpinsCount
			}
			// ...FREE SPINS DETECTION

			// RE-SPIN DETECTION...
			lockedReelsIndexes = []
			if (!roundSteps[roundSteps.length - 1]?.lockedReelsIndexes) {
				lockedReelsIndexes = [0]
				if(
					reels[0][0]
					&& reels[4][0]
					&& (
						reels[0][0] === reels[4][0]
						|| reels[0][0] === WILD_SYMBOL_ID
					)
				) { 
					for(let x = 1; x <= 3; x++) {
						for(let y = 0; y < regularReelSize; y++) {
							if(reels[x][y] === reels[4][0]) {
								lockedReelsIndexes.push(x)
								break
							}
						}
					}
				}

				if (lockedReelsIndexes.length <= 2) {
					lockedReelsIndexes = []
				} else {
					lockedReelsIndexes.push(4)
					step.lockedReelsIndexes = lockedReelsIndexes.map(id => id)
				}
			}
			// ...RE-SPIN DETECTION

			roundSteps.push(step)

			// cheat reels dropped after 1st spin
			desiredReels = undefined

			// just to make it easier to adjust reels values while developing
			if(roundSteps.length > 100)
				throw 'infinite wins! 😱😱😱'

		} while (freeSpinsCount || lockedReelsIndexes.length)

		return {
			steps: roundSteps,
			totalCoefficient
		}
	}

	// DEBUG...
	print(reels = this.reels, caption = '___') {
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
}

module.exports = {
	MINIMAL_REGULAR_REEL_LENGTH,
	MAXIMAL_REGULAR_REEL_LENGTH,
	REELS_LENGTHS,
	LOW_VALUE_IDS,
	HIGH_VALUE_IDS,
	EMPTY_SYMBOL_ID,
	SCATTER_SYMBOL_ID,
	WILD_SYMBOL_ID,
	SPECIAL_SYMBOLS_IDS,
	REGULAR_SYMBOLS_IDS,
	HOT_SYMBOLS_IDS,
	REGULAR_REELS_SYMBOLS_IDS,
	SYMBOLS_IDS,
	COEFFICIENTS,
	WIN_LINES,
	SlotMachine
}