import {
	RANDOM_REELS_SYMBOLS_IDS,
	REELS_COUNT,
	CELLS_PER_REEL_COUNT,
	REGULAR_SYMBOLS_IDS
} from "./Constants"

export function getRandomSymbolId(reelIndex) {
	const randomSymbolsIds = RANDOM_REELS_SYMBOLS_IDS[reelIndex]

	return randomSymbolsIds[
		Math.trunc(Math.random() * randomSymbolsIds.length)
	]
}

export function generateMatrix(initialValue) {
	return new Array(REELS_COUNT).fill(0).map(_ => new Array(CELLS_PER_REEL_COUNT).fill(initialValue))
}

export function formatMoney(value) {
	return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

/**
 * random symbols, no win combinations
 */
export function getRandomLoseReels() {
	const reels = new Array(REELS_COUNT).fill(0).map(_ => [])

	let availableSymbols = [...REGULAR_SYMBOLS_IDS]
	for (let x = 0; x < reels.length; x++) {
		for (let y = 0; y < CELLS_PER_REEL_COUNT; y++) {
			if (!availableSymbols.length)
				availableSymbols = [...REGULAR_SYMBOLS_IDS]
			
			const randomSymbolIndex = Math.trunc(Math.random() * availableSymbols.length)
			reels[x][y] = availableSymbols[randomSymbolIndex]
			availableSymbols.splice(randomSymbolIndex, 1)
		}
	}

	return reels
}