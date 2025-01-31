export const CELL_WIDTH = 245
// export const CELL_HEIGHT = 222
export const CELL_HEIGHT = 218
export const REELS_COUNT = 5
export const CELLS_PER_REEL_COUNT = 3
export const REELS_WIDTH = REELS_COUNT * CELL_WIDTH
export const REELS_HEIGHT = CELLS_PER_REEL_COUNT * CELL_HEIGHT
export const SCATTER_SYMBOL_ID = 9
export const SYMBOLS_IDS = [
	0, // Low value
	1, // Low value
	2, // Low value
	3, // Low value
	4, // Low value
	5, // High value
	6, // High value
	7, // High value
	8, // High value
	SCATTER_SYMBOL_ID, // Scatter
]

export const RANDOM_REELS_SYMBOLS_IDS = [
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
]
export const TURBO_MODE_TIME_SCALE = 1.5
export const REGULAR_SYMBOLS_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
export const POSSIBLE_REELS_SYMBOLS = [
	[...REGULAR_SYMBOLS_IDS, SCATTER_SYMBOL_ID],
	[...REGULAR_SYMBOLS_IDS, SCATTER_SYMBOL_ID],
	[...REGULAR_SYMBOLS_IDS, SCATTER_SYMBOL_ID],
	[...REGULAR_SYMBOLS_IDS, SCATTER_SYMBOL_ID],
	[...REGULAR_SYMBOLS_IDS, SCATTER_SYMBOL_ID],
]
export const WIN_COEFFICIENTS = {
	BIG: 10,
	HUGE: 50,
	MEGA: 100,
}