export const REELS_WIDTH = 5
export const REELS_HEIGHT = 3

const LOW_VALUE_IDS = [
	0, // 10
	1, // J
	2, // Q
]

const MIDDLE_VALUE_IDS = [
	3, // K
	4, // A
]

const HIGH_VALUE_IDS = [
	5, // SCARAB
	6, // HARPY
	7, // PHARAOH
	8, // COWBOY
]

const SCATTER_SYMBOL_ID = 9

export const REGULAR_SYMBOLS_IDS = [...LOW_VALUE_IDS, ...MIDDLE_VALUE_IDS, ...HIGH_VALUE_IDS]

export const COEFFICIENTS = {
	0: {3: 5,  4: 25,  5: 100}, // 10
	1: {3: 5,  4: 25,  5: 100}, // J
	2: {3: 5,  4: 25,  5: 100}, // Q
	3: {3: 5,  4: 40,  5: 150}, // K
	4: {3: 5,  4: 40,  5: 150}, // A
	5: {2: 5,  3: 30,  4: 100,  5: 750}, // SCARAB
	6: {2: 5,  3: 30,  4: 100,  5: 750}, // HARPY
	7: {2: 5,  3: 40,  4: 400,  5: 2000}, // PHARAOH
	8: {2: 10, 3: 100, 4: 1000, 5: 5000}, // COWBOY
	9:{3: 2,  4: 20,  5: 200}, // SCATTER
}

export const WIN_LINES = [
	[1, 1, 1, 1, 1], // 0
	[0, 0, 0, 0, 0], // 1
	[2, 2, 2, 2, 2], // 2
	[0, 1, 2, 1, 0], // 3
	[2, 1, 0, 1, 2], // 4
	[1, 2, 2, 2, 1], // 5
	[1, 0, 0, 0, 1], // 6
	[2, 2, 1, 0, 0], // 7
	[0, 0, 1, 2, 2], // 8
	[2, 1, 1, 1, 0], // 9
]

export class SlotMachine {
	riskBet = 1
	riskCoefficient = 10
	presetRiskOption
	presetSpecialSymbolId
	probability = []
	reels = new Array(REELS_WIDTH).fill(0).map(_ => new Array(REELS_HEIGHT).fill(0))
	lowValueIds = LOW_VALUE_IDS
	middleValueIds = MIDDLE_VALUE_IDS
	highValueIds = HIGH_VALUE_IDS
	regularSymbolsIds = REGULAR_SYMBOLS_IDS
	width = REELS_WIDTH
	height = REELS_HEIGHT

	constructor(probability) {
		this.probability = probability
	}

	roll({
		isFreeSpinsMode = false,
		desiredReels,
	}) {

		const {
			reels,
			probability: {
				regularProbability,
				scatterProbabilityDefault,
				scatterProbabilityFreeSpins
			}
		} = this

		if(desiredReels) {
			reels.forEach((reel, x) => reel.forEach((_, y) =>
				reel[y] = desiredReels[x][y] ?? 0))

			return reels
		}
		
		reels.forEach((reel, x) => {
			reel.forEach((_, y) => {
				const randomNumber = Math.random()
				let probabilityOffset = 0

				// REGULAR SYMBOLS...
				for (let i = 0; i < REGULAR_SYMBOLS_IDS.length; i++) {
					const id = REGULAR_SYMBOLS_IDS[i]
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
			})

			// SPECIAL SUBSTITUTE...
			// SCATTER...
			const scatterProbability = isFreeSpinsMode
				? scatterProbabilityFreeSpins
				: scatterProbabilityDefault

			if (Math.random() < scatterProbability[x])
				reel[Math.trunc(Math.random() * REELS_HEIGHT)] = SCATTER_SYMBOL_ID
			// ...SCATTER
			// ...SPECIAL SUBSTITUTE
		})

		return reels
	}

	getWinLines({
		reels = this.reels,
		reelsIndexes = [0, 1, 2, 3, 4],
		betPerLine = 1,
		linesCount = 10,
	}) {
		if(!reelsIndexes.length) return []

		const winLines = []

		for (let i = 0; i < linesCount; i++) {
			const map = WIN_LINES[i]
			let matchingSymbolId = reels[reelsIndexes[0]][map[0]]
			let matchesCount = 0
			let scatterMatchesCount = 0

			for (let i = 0; i < reelsIndexes.length; i++) {
				const reelIndex = reelsIndexes[i]
				const symbolId = reels[reelIndex][map[reelIndex]]
				if (matchingSymbolId === SCATTER_SYMBOL_ID)
					matchingSymbolId = symbolId

				if (
					symbolId !== matchingSymbolId
					&& symbolId !== SCATTER_SYMBOL_ID
				) {
					break
				}

				matchesCount++
				if (matchingSymbolId === SCATTER_SYMBOL_ID)
					scatterMatchesCount++
			}

			const scatterCoefficient = COEFFICIENTS[SCATTER_SYMBOL_ID][scatterMatchesCount]
			const finalCoefficient = scatterCoefficient
				|| COEFFICIENTS[matchingSymbolId]?.[matchesCount]

			const finalMatchesCount = scatterCoefficient
				? scatterMatchesCount
				: matchesCount
			
			finalCoefficient && winLines.push({
				lineIndex: i,
				coefficient: finalCoefficient / linesCount,
				payout: Number((finalCoefficient * betPerLine).toFixed(2)),
				matchesCount: finalMatchesCount,
			})
		}

		return winLines
	}

	generateSingleGameDescriptor({
		betPerLine = 1, // PER LINE!!!
		linesCount = 10,
		desiredReels,
		riskOption,
		presetSpecialSymbolId
	}) {
		this.presetRiskOption = riskOption
		this.presetSpecialSymbolId = presetSpecialSymbolId
		this.riskCoefficient =  0
		let roundSteps = []
		let isFreeSpinsMode = false
		let freeSpinsCount = 0
		let totalCoefficient = 0
		let specialSymbolId = 0

		const betPerAllLines = betPerLine * linesCount

		do {

			const step = {}
			const reels = this.roll({
				isFreeSpinsMode,
				desiredReels
			})

			freeSpinsCount = Math.max(0, freeSpinsCount - 1)

			// DEFAULT WIN...
			let totalStepCoefficient = 0
			const winLines = this.getWinLines({reels, betPerLine, linesCount})
			winLines.forEach(({coefficient}) => {
				totalCoefficient += coefficient
				totalStepCoefficient += coefficient
			})

			if (totalStepCoefficient) {
				step.winLines = winLines
				step.stepCoefficient = totalStepCoefficient
				step.stepPayout = Number((totalStepCoefficient * betPerAllLines).toFixed(2))
			}
			// ...DEFAULT WIN

			step.reels = reels.map(reel => reel.map(symbolId => symbolId))

			// FREE SPINS DETECTION...
			if (freeSpinsCount) step.freeSpinsCount = freeSpinsCount

			let scattersCount = 0
			for(const reel of reels)
				for(const symbolId of reel)
					if(symbolId === SCATTER_SYMBOL_ID)
						scattersCount++
			

			if (scattersCount >= 3) {
				const awardedFreeSpinsCount = 10
				step.awardedFreeSpinsCount = awardedFreeSpinsCount
				freeSpinsCount += awardedFreeSpinsCount
				step.freeSpinsCount = freeSpinsCount

				if (!isFreeSpinsMode) {
					isFreeSpinsMode = true
					specialSymbolId = REGULAR_SYMBOLS_IDS[Math.trunc(REGULAR_SYMBOLS_IDS.length * Math.random())]
					
					if (this.presetSpecialSymbolId) {
						specialSymbolId = this.presetSpecialSymbolId
					}
					
					step.specialSymbolId = specialSymbolId
				}
			}
			// ...FREE SPINS DETECTION

			// SPECIAL WIN...
			if (
				specialSymbolId !== undefined
				&& roundSteps.length
			) {
				const specialReelsIndexes = []
				for (let x = 0; x < REELS_WIDTH; x++) {
					for (let y = 0; y < REELS_HEIGHT; y++) {
						if (reels[x][y] === specialSymbolId) {
							specialReelsIndexes.push(x)
							break
						}
					}
				}
				// SUBSTITUTION...
				specialReelsIndexes.forEach(x => {
					for (let y = 0; y < REELS_HEIGHT; y++) {
						reels[x][y] = specialSymbolId
					}
				})
				// ...SUBSTITUTION
	
				let stepSpecialCoefficient = 0
				const specialWinLines = this.getWinLines({
					reelsIndexes: specialReelsIndexes,
					reels,
					betPerLine,
					linesCount
				})

				specialWinLines.forEach(({coefficient}) => {
					totalCoefficient += coefficient
					stepSpecialCoefficient += coefficient
				})

				if (stepSpecialCoefficient) {
					step.substitutionSymbolId = specialSymbolId
					step.specialWinReels = specialReelsIndexes
					step.specialWinLines = specialWinLines
					step.stepSpecialCoefficient = stepSpecialCoefficient
					step.stepSpecialPayout = Number((stepSpecialCoefficient * betPerAllLines).toFixed(2))
				}
			}
			// ...SPECIAL WIN

			roundSteps.push(step)

			// cheat reels dropped after 1st spin
			desiredReels = undefined

			// just to make it easier to adjust reels values while developing
			if(roundSteps.length > 100)
				throw 'infinite wins! 😱😱😱'

		} while (freeSpinsCount)

		this.riskBet = betPerAllLines
		this.riskCoefficient = totalCoefficient


		return {
			steps: roundSteps,
			totalCoefficient
		}
	}

	generateRiskGameDescriptor({
		option = 0,
		riskBet = this.riskBet,
		riskCoefficient = this.riskCoefficient
	}) {
		let isWin = Math.random() > 0.5

		if (this.presetRiskOption !== undefined) {
			isWin = this.presetRiskOption === option
		}

		// WIN...
		// STATS UPD REQUIRED!!!
		if (isWin) {
			const coefficient = riskCoefficient * 2
			const payout = riskBet * coefficient

			this.riskCoefficient = coefficient

			// STATISTICS UPDATE...
			const { statistics } = this
			if (statistics) {
				const index = statistics.winCoefficients.length - 1
				statistics.winCoefficients[index] = coefficient
			}
			// ...STATISTICS UPDATE

			return {
				option: option ? 1 : 0,
				coefficient,
				payout: Number(payout.toFixed(2))
			}
		}
		// ...WIN

		// LOOSE...
		this.riskCoefficient = 0

		// STATISTICS UPDATE...
		const { statistics } = this
		if (statistics) {
			const index = statistics.winCoefficients.length - 1
			statistics.winCoefficients[index] = 0
		}
		// ...STATISTICS UPDATE

		return {
			option: option ? 0 : 1,
			coefficient: 0,
			payout: 0
		}
		// ...LOSE
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