const REELS_WIDTH = 6
const REELS_HEIGHT = 6
const DEFAULT_REEL_LENGTH = 4
const EXTENDED_REEL_LENGTH = 6
const REELS_LENGTHS = [
	EXTENDED_REEL_LENGTH,
	EXTENDED_REEL_LENGTH,
	EXTENDED_REEL_LENGTH,
	EXTENDED_REEL_LENGTH,
	EXTENDED_REEL_LENGTH,
	EXTENDED_REEL_LENGTH,
]
const LOW_VALUE_IDS = [
	1, // ♣️ CLUBS
	2, // ♥️ HEARTS
	3, // ♦️ DIAMONDS
	4, // ♠️ SPADES
]
const HIGH_VALUE_IDS = [
	5, // ANCHOR
	6, // BARREL
	7, // COMPASS
	8, // MAP
]

const WILD_SYMBOL_ID = 9
const SCATTER_SYMBOL_ID = 10

const SPECIAL_SYMBOLS_IDS = [SCATTER_SYMBOL_ID, WILD_SYMBOL_ID]
const REGULAR_SYMBOLS_IDS = [...LOW_VALUE_IDS, ...HIGH_VALUE_IDS]

const REGULAR_REELS_SYMBOLS_IDS = [
	REGULAR_SYMBOLS_IDS,
	REGULAR_SYMBOLS_IDS,
	REGULAR_SYMBOLS_IDS,
	REGULAR_SYMBOLS_IDS,
	REGULAR_SYMBOLS_IDS,
	REGULAR_SYMBOLS_IDS,
]

const SYMBOLS_IDS = [
	...REGULAR_SYMBOLS_IDS,
	...SPECIAL_SYMBOLS_IDS
]

const COEFFICIENTS = {
	1: {3: 0.1, 4: 0.2, 5: 0.3, 6: 0.4}, // ♦️ CLUBS
	2: {3: 0.1, 4: 0.2, 5: 0.3, 6: 0.4}, // ♥️ HEARTS
	3: {3: 0.1, 4: 0.2, 5: 0.3, 6: 0.4}, // ♦️ DIAMONDS
	4: {3: 0.1, 4: 0.2, 5: 0.3, 6: 0.4}, // ♠️ SPADES
	5: {3: 0.4, 4: 0.5, 5: 0.6, 6: 0.7}, // ANCHOR
	6: {3: 0.5, 4: 0.6, 5: 0.7, 6: 0.8}, // COMPASS
	7: {3: 0.6, 4: 0.7, 5: 0.8, 6: 0.9}, // MAP
	8: {3: 0.7, 4: 0.8, 5: 0.9, 6: 1.0}, // BARREL
}

const WIN_LINES = [
	[0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1],
	[2, 2, 2, 2, 2, 2],
	[3, 3, 3, 3, 3, 3],
	[4, 4, 4, 4, 4, 4],
	[5, 5, 5, 5, 5, 5],

	[0, 1, 2, 2, 1, 0],
	[1, 2, 3, 3, 2, 1],
	[2, 3, 4, 4, 3, 2],
	[3, 4, 5, 5, 4, 3],

	[2, 1, 0, 0, 1, 2],
	[3, 2, 1, 1, 2, 3],
	[4, 3, 2, 2, 3, 4],
	[5, 4, 3, 3, 4, 5],

	[0, 1, 1, 1, 1, 0],
	[1, 2, 2, 2, 2, 1],
	[2, 3, 3, 3, 3, 2],
	[3, 4, 4, 4, 4, 3],
	[4, 5, 5, 5, 5, 4],

	[1, 0, 0, 0, 0, 1],
	[2, 1, 1, 1, 1, 2],
	[3, 2, 2, 2, 2, 3],
	[4, 3, 3, 3, 3, 4],
	[5, 4, 4, 4, 4, 5],

	[0, 1, 0, 1, 0, 1],
	[1, 2, 1, 2, 1, 2],
	[2, 3, 2, 3, 2, 3],
	[3, 4, 3, 4, 3, 4],
	[4, 5, 4, 5, 4, 5],

	[1, 0, 1, 0, 1, 0],
	[2, 1, 2, 1, 2, 1],
	[3, 2, 3, 2, 3, 2],
	[4, 3, 4, 3, 4, 3],
	[5, 4, 5, 4, 5, 4],
]

function generateWildSector(width = 2, height = 2) {
	return {
		x: 1 + Math.trunc(Math.random() * (REELS_WIDTH - width - 1)),
		y: 1 + Math.trunc(Math.random() * (REELS_HEIGHT - height - 1)),
		width,
		height
	}
}



class SlotMachine {
	probability = []
	reels = REELS_LENGTHS.map(length => new Array(length).fill(0))
	lowValueIds = LOW_VALUE_IDS
	highValueIds = HIGH_VALUE_IDS
	regularSymbolsIds = REGULAR_REELS_SYMBOLS_IDS
	specialSymbolsIds = SPECIAL_SYMBOLS_IDS

	constructor(probability) {
		this.probability = probability
	}

	roll({
		reelLength = 4,
		isFreeSpinsMode = false,
		desiredReels,
	}) {
		const {
			reels,
			probability: {
				regularSymbolsProbability,
				specialSymbolsProbability
			}
		} = this

		if (desiredReels) {
			reels.forEach((reel, x) => reel.forEach((_, y) =>
				reel[y] = desiredReels[x][y] ?? 0))

			return reels
		}
		
		reels.forEach((reel, x) => {
			const isLocked = false
			reel.forEach((_, y) => {
				const symbolsIds = REGULAR_REELS_SYMBOLS_IDS[x]
				const randomNumber = Math.random()
				let probabilityOffset = 0

				// REGULAR SYMBOLS...
				if (y >= reelLength) {
					reel[y] = 0
				} else if (isLocked) {
					reel[y] = reels[4][0]
				} else for (let i = 0; i < symbolsIds.length; i++) {
					const id = symbolsIds[i]
					const symbolProbability = probabilityOffset + regularSymbolsProbability[id][x][y]	
					if (
						regularSymbolsProbability[id][x][y]
						&& randomNumber <= symbolProbability
					) {
						reel[y] = id
						break
					}
		
					probabilityOffset = symbolProbability
				}
				// ...REGULAR SYMBOLS
			})

			// SPECIAL SYMBOLS SUBSTITUTION...
			// WILD...
			const wildProbability = isFreeSpinsMode
				? specialSymbolsProbability.defaultGame.wild
				: specialSymbolsProbability.bonusGame.wild
			
			if (!isLocked && Math.random() < wildProbability[x])
				reel[Math.trunc(Math.random() * reelLength)] = WILD_SYMBOL_ID
			// ...WILD

			// SCATTER...
			const scatterProbability = isFreeSpinsMode
				? specialSymbolsProbability.defaultGame.scatter
				: specialSymbolsProbability.bonusGame.scatter

			if (!isLocked && Math.random() < scatterProbability[x])
				reel[Math.trunc(Math.random() * reelLength)] = SCATTER_SYMBOL_ID
			// ...SCATTER
			// ...SPECIAL SYMBOLS SUBSTITUTION
		})

		return reels
	}

	getWinLines(
		reels = this.reels,
		bet = 1,
		wildSubstitutionSymbolId = -1
	) {
		const winLines = []
		WIN_LINES.forEach((map, lineIndex) => {
			let matchingSymbolId = reels[0][map[0]]
			let matchesCount = 1

			for (let i = 1; i < reels.length; i++) {
				const symbolId = reels[i][map[i]]

				if (
					symbolId !== matchingSymbolId
					&& symbolId !== WILD_SYMBOL_ID
					&& symbolId !== wildSubstitutionSymbolId
				) {
					break
				}

				matchesCount++
			}

			const coefficient = COEFFICIENTS[matchingSymbolId]?.[matchesCount]
			coefficient && winLines.push({
				lineIndex,
				coefficient,
				matchesCount,
				payout: Number((coefficient * bet).toFixed(2)),
			})
		})

		return winLines
	}

	rollBonuses() {
		const possibleBonusesMap = {
			multiplier: 1,
			wildSubstitution: 1,
			bonusFreeSpin: 10, 
			wildSector: 1
		}

		const keys = Object.keys(possibleBonusesMap)
		const awardedBonuses = {
			expansion: 1,
		}
	
		for (let i = 0; i < 4; i++) {
			
			let randomIndex = Math.trunc(Math.random() * keys.length)
			while (!possibleBonusesMap[keys[randomIndex]]) {
				randomIndex = (randomIndex + 1) % keys.length
			}

			const bonusName = keys[randomIndex]
			awardedBonuses[bonusName] = (awardedBonuses[bonusName] ?? 0) + 1
			possibleBonusesMap[bonusName]--
		}

		if (awardedBonuses.wildSubstitution) {
			awardedBonuses.wildSubstitutionSymbolId = HIGH_VALUE_IDS[
				Math.trunc(Math.random() * HIGH_VALUE_IDS.length)
			]

			delete awardedBonuses.wildSubstitution
		}

		return awardedBonuses
	}

	generateSingleGameDescriptor({
		bet = 1,
		isFreeSpinsAwardPurchased,
		desiredReels,
	}) {
		const bonuses = {
			multiplier: 1,
			wildSubstitutionsCount: 0,
			wildSubstitutionSymbolId: undefined,
			wildSector: undefined
		}

		let roundSteps = []
		let isFreeSpinsMode = false
		let freeSpinsCount = 0
		let totalCoefficient = 0
		let reelLength = DEFAULT_REEL_LENGTH

		do {
			freeSpinsCount = Math.max(0, freeSpinsCount - 1)
			const step = {}
			const reels = this.roll({
				reelLength,
				isFreeSpinsMode,
				desiredReels
			})


			// WILD SECTOR SUBSTITUTION...
			if(bonuses.wildSector) {
				const { x, y, width, height } = bonuses.wildSector

				for (let offsetX = 0; offsetX < width; offsetX++ )
					for (let offsetY = 0; offsetY < height; offsetY++ )
						reels[x + offsetX][y + offsetY] = WILD_SYMBOL_ID 

				bonuses.wildSector = generateWildSector()
				step.wildSector = { x, y, width, height }
			}
			// ...WILD SECTOR SUBSTITUTION

			let totalStepCoefficient = 0
			const winLines = this.getWinLines(
				reels,
				bet,
				bonuses.wildSubstitutionSymbolId,
			)

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
				&& isFreeSpinsAwardPurchased
			) {
				const scatterSize = 3
				const x = Math.trunc(Math.random() * (REELS_WIDTH - scatterSize + 1))
				const y = Math.trunc(Math.random() * (DEFAULT_REEL_LENGTH - scatterSize + 1))

				for (let scatterX = 0; scatterX < scatterSize; scatterX++ )
					for (let scatterY = 0; scatterY < scatterSize; scatterY++ )
						reels[x + scatterX][y + scatterY] = SCATTER_SYMBOL_ID 
			}
			// ...PURCHASED BONUS PATCH

			step.reels = reels.map(reel => {
				const finalReel = []
				for (let y = 0; (y < reelLength && y < reel.length); y++)
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
			if (scattersCount >= 4) {
				awardedFreeSpinsCount = 8
				reelLength = 6
			}

			if(awardedFreeSpinsCount) {
				freeSpinsCount += awardedFreeSpinsCount
				step.awardedFreeSpinsCount = awardedFreeSpinsCount
				if (!isFreeSpinsMode) {
					// AWARDING BONUSES...
					const awardedBonuses = this.rollBonuses()
					bonuses.multiplier = awardedBonuses.multiplier ? 2 : 1
					bonuses.wildSubstitutionSymbolId = awardedBonuses.wildSubstitutionSymbolId
					
					if (awardedBonuses.wildSector) {
						const wildSector = generateWildSector()

						bonuses.wildSector = wildSector
						step.wildSector = {
							x: wildSector.x,
							y: wildSector.y,
							width: wildSector.width,
							height: wildSector.height,
						}
					}

					freeSpinsCount += awardedBonuses.bonusFreeSpin ?? 0
					step.awardedBonuses = awardedBonuses
					// ...AWARDING BONUSES
				}

				isFreeSpinsMode = true
			}
			// ...FREE SPINS DETECTION

			roundSteps.push(step)

			// cheat reels dropped after 1st spin
			desiredReels = undefined

			// just to make it easier to adjust reels values while developing
			if(roundSteps.length > 100)
				throw 'infinite wins! 😱😱😱'

		} while (freeSpinsCount)

			
		const totalCoefficientBeforeMultiplier = totalCoefficient
		totalCoefficient *= bonuses.multiplier

		return {
			steps: roundSteps,
			totalCoefficientBeforeMultiplier,
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
	REELS_WIDTH,
	REELS_HEIGHT,
	DEFAULT_REEL_LENGTH,
	EXTENDED_REEL_LENGTH,
	REELS_LENGTHS,
	LOW_VALUE_IDS,
	HIGH_VALUE_IDS,
	WILD_SYMBOL_ID,
	SCATTER_SYMBOL_ID,
	SPECIAL_SYMBOLS_IDS,
	REGULAR_SYMBOLS_IDS,
	REGULAR_REELS_SYMBOLS_IDS,
	SYMBOLS_IDS,
	COEFFICIENTS,
	WIN_LINES,
	SlotMachine
}