const random = require("../../../RNG/RNG")

const REELS_COUNT = 7
const CELLS_PER_REEL_COUNT = 7
const REGULAR_SYMBOLS_IDS = [
	2, // RED
	3, // PINK
	4, // GREEN
	5, // YELLOW
	6, // AZURE
	7, // BLUE
]

const WILD_SYMBOL_ID = 1

const SYMBOLS_IDS = [WILD_SYMBOL_ID, ...REGULAR_SYMBOLS_IDS]

const REELS_SYMBOLS_IDS = [
	REGULAR_SYMBOLS_IDS,
	SYMBOLS_IDS,
	SYMBOLS_IDS,
	SYMBOLS_IDS,
	SYMBOLS_IDS,
	SYMBOLS_IDS,
	SYMBOLS_IDS,
]

const COEFFICIENTS = {
	2: { 5: 0.5, 6: 1.0,  7: 2.0,  8: 5.0, 9: 10 }, // RED
	3: { 5: 0.5, 6: 1.0,  7: 1.9,  8: 5.0, 9: 10 }, // PINK
	4: { 5: 0.5, 6: 0.9,  7: 1.8,  8: 4.0, 9: 10 }, // GREEN
	5: { 5: 0.3, 6: 0.9,  7: 1.7,  8: 4.0, 9: 8 }, // YELLOW
	6: { 5: 0.3, 6: 0.8,  7: 1.6,  8: 3.0, 9: 8 }, // AZURE
	7: { 5: 0.3, 6: 0.8,  7: 1.5,  8: 3.0, 9: 8 }, // BLUE
}

class SlotMachine {
	probability
	
	constructor(probability) {
		this.probability = probability
	}

	async roll(desiredReels) {
		const { probability } =  this

		const reels = new Array(REELS_COUNT)
			.fill(0)
			.map(_ => new Array(CELLS_PER_REEL_COUNT)
			.fill(0)
			.map(_ => 0))

		if (desiredReels) {
			reels.forEach((reel, x) => reel.forEach((_, y) =>
				reel[y] = desiredReels[x][y] ?? 0))

			return reels
		}
		
		for(let x = 0; x < reels.length; x++) {
			const reel = reels[x]
			for(let y = 0; y < reel.length; y++) {
				const symbolsIds = REELS_SYMBOLS_IDS[x]
				const randomNumber = await random()
				let probabilityOffset = 0

				// REGULAR SYMBOLS...
				for (let i = 0; i < symbolsIds.length; i++) {
					const id = symbolsIds[i]
					const symbolProbability = probabilityOffset + probability[id][x][y]	
					if (
						probability[id][x][y]
						&& randomNumber <= symbolProbability
					) {
						reel[y] = id
						break
					}
		
					probabilityOffset = symbolProbability
				}
				// ...REGULAR SYMBOLS
			}
		}

		return reels
	}

	expandCollapse(
		symbolId,
		x,
		y,
		reels,
		corruptionMap,
		collapseCoordinates
	) {
		

		if (x < 0) return
		if (y < 0) return
		if (x >= REELS_COUNT) return
		if (y >= CELLS_PER_REEL_COUNT) return
		if (corruptionMap[x][y]) return
		
		if (reels[x][y] !== symbolId && reels[x][y] !== WILD_SYMBOL_ID) return
	
		corruptionMap[x][y] = 1
		collapseCoordinates.push([x, y])

		return true
	}

	getWinDescriptor(reels, bet = 1) {
		const collapses = []
		const expansionVectors = [[0, -1], [1, 0], [0, 1], [-1, 0]]
		const corruptionMap = reels.map(reel => reel.map(_ => 0))

		let coefficient = 0

		for(let x = 0; x < REELS_COUNT; x++) {
			for(let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
				if(reels[x][y] === WILD_SYMBOL_ID) continue
				if(corruptionMap[x][y]) continue

				corruptionMap[x][y] = 1
				const collapseCoordinates = [[x, y]]
				let symbolId = reels[x][y]

				let expansionsCount = 0
				do {
					const length = collapseCoordinates.length + 0
					expansionsCount = 0

					for (let i = 0; i < length; i++) {
						const collapseX = collapseCoordinates[i][0]
						const collapseY = collapseCoordinates[i][1]

						expansionVectors.forEach(([vectorX, vectorY]) => {
							if (
							this.expandCollapse(
								symbolId,
								collapseX + vectorX,
								collapseY + vectorY,
								reels,
								corruptionMap,
								collapseCoordinates
							)) {
								expansionsCount++
							}
						})
					}
				} while (expansionsCount)

				if (collapseCoordinates.length > 4) {
					const collapseCoefficient = COEFFICIENTS[symbolId][Math.min(collapseCoordinates.length, 9)]

					collapses.push({
						coordinates: collapseCoordinates,
						symbolId,
						coefficient: collapseCoefficient,
						payout: collapseCoefficient * bet
					})

					coefficient += collapseCoefficient
				} else {
					collapseCoordinates.forEach(([x, y]) => {
						corruptionMap[x][y] = 0
					})
				}
			}
		}

		if (coefficient) {
			return {
				corruptionMap,
				collapses,
				coefficient
			}
		}
	}

	async getReelsPatch(cascadedReels) {
		const reels = await this.roll()
		const reelsPatch = cascadedReels.map((reel, x) => {
			let cellsCount = 0
			for(let y = 0; y < reel.length; y++) {
				if(reel[y] !== 0) break
				cellsCount++
			}

			const singleReelPatch = []
			
			for(let y = 0; y < cellsCount; y++)
				singleReelPatch.push(reels[x][y])

			return singleReelPatch
		})

		return reelsPatch
	}

	async cascadeReels(reels, corruptionMap) {
		// MAPPING CASCADE...
		const cascadeMap = reels.map(reel => reel.map(_ => 0))
		for(let x = 0; x < REELS_COUNT; x++) {
			let distance = 0
			for(let y = reels[x].length - 1; y >= 0; y--) {    
				if(corruptionMap[x][y] > 0) {
					distance++
					cascadeMap[x][y] = 0
				} else {
					cascadeMap[x][y] = distance
				}
			}
		}
		// ...MAPPING CASCADE

		// CORRUPTION...
		for (let x = 0; x < REELS_COUNT; x++)
			for(let y = 0; y < reels[x].length; y++)
				if(corruptionMap[x][y] === 1)
					reels[x][y] = 0
				else if (corruptionMap[x][y] === -1)
					reels[x][y] = WILD_SYMBOL_ID
		// ...CORRUPTION

		// FALL...
		for (let x = 0; x < REELS_COUNT; x++)
			for(let y = reels[x].length - 1; y >= 0; y--)
				if(cascadeMap[x][y]) {
					reels[x][y + cascadeMap[x][y]] = reels[x][y]
					reels[x][y] = 0
				}
		// ...FALL

		// PATCH...
		const reelsPatch = await this.getReelsPatch(reels)
		for (let x = 0; x < REELS_COUNT; x++)
			for(let y = 0; y < reelsPatch[x].length; y++)
				reels[x][y] = reelsPatch[x][y]
		// ...PATCH

		return reelsPatch
	}

	async getCascadeSteps({
		bet = 1,
		reels,
	}) {
		const steps = []
		let winDescriptor

		do {
			const step = {}
			const isFirstStep = !steps.length

			winDescriptor = this.getWinDescriptor(reels, bet)

			if(isFirstStep)
				step.reels = reels.map(reel => reel.map(symbolId => symbolId))
	
			if(isFirstStep || winDescriptor)
				steps.push(step)

			if(!winDescriptor) { break }
			
			const {
				corruptionMap,
				coefficient,
				collapses,
			} = winDescriptor

			if(corruptionMap) {
				step.collapses = collapses
				// step.corruptionMap = corruptionMap
				step.coefficient = coefficient
				step.payout = Number((coefficient * bet).toFixed(2))
			}

			step.reelsPatch = await this.cascadeReels(reels, corruptionMap)

			// just to make it easier to adjust reels values while developing
			if(steps.length > 100) {
				console.log(steps)
				throw 'infinite wins! 😱😱😱'
			}

		} while (winDescriptor)

		return steps
	}

	async generateSingleGameDescriptor({
		bet = 1,
		desiredReels,
	}) {

		const reels = desiredReels ?? await this.roll(desiredReels)
		const steps = await this.getCascadeSteps({
			reels,
			bet,
		})

		// TOTAL COEFFICIENT...
		let totalCoefficient = 0
		steps.forEach(({coefficient}) => {
			totalCoefficient += (coefficient || 0)
		})
		// ...TOTAL COEFFICIENT

		return {
			steps,
			totalCoefficient
		}
	}


	// DEBUG...
	print(reels, caption = '___') {
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
	REELS_COUNT,
	CELLS_PER_REEL_COUNT,
	REGULAR_SYMBOLS_IDS,
	WILD_SYMBOL_ID,
	SYMBOLS_IDS,
	REELS_SYMBOLS_IDS,
	COEFFICIENTS,
	SlotMachine
}