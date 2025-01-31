export const CELL_WIDTH = 72
export const CELL_HEIGHT = 71
export const REELS_COUNT = 7
export const CELLS_PER_REEL_COUNT = 7
export const REELS_WIDTH = REELS_COUNT * CELL_WIDTH
export const REELS_HEIGHT = CELLS_PER_REEL_COUNT * CELL_HEIGHT
export const WILD_SYMBOL_ID = 1
export const SYMBOLS_IDS = [
	0, // EMPTY
	WILD_SYMBOL_ID, // WILD
	2, // RED
	3, // PINK
	4, // GREEN
	5, // YELLOW
	6, // AZURE
	7, // BLUE
]

export const RANDOM_REELS_SYMBOLS_IDS = [
	[2, 3, 4, 5, 6, 7],
	[1, 2, 3, 4, 5, 6, 7],
	[1, 2, 3, 4, 5, 6, 7],
	[1, 2, 3, 4, 5, 6, 7],
	[1, 2, 3, 4, 5, 6, 7],
	[1, 2, 3, 4, 5, 6, 7],
	[1, 2, 3, 4, 5, 6, 7],
]
export const TURBO_MODE_TIME_SCALE = 1.5
export const REGULAR_SYMBOLS_IDS = [2, 3, 4, 5, 6, 7]
export const POSSIBLE_REELS_SYMBOLS = [
	[0, ...REGULAR_SYMBOLS_IDS],
	[0, WILD_SYMBOL_ID, ...REGULAR_SYMBOLS_IDS],
	[0, WILD_SYMBOL_ID, ...REGULAR_SYMBOLS_IDS],
	[0, WILD_SYMBOL_ID, ...REGULAR_SYMBOLS_IDS],
	[0, WILD_SYMBOL_ID, ...REGULAR_SYMBOLS_IDS],
	[0, WILD_SYMBOL_ID, ...REGULAR_SYMBOLS_IDS],
	[0, WILD_SYMBOL_ID, ...REGULAR_SYMBOLS_IDS],

]