const ERROR_CODES = { OUT_OF_BALANCE: 200 }

export class GameLogic {
	payout
	winLines
	coefficients
	betsOptions = []
	linesOptions = []
	balance = 0
	currencyCode = ''
	betIndex
	linesCount
	webAPI

	constructor({
		webAPI,
		presentation
	}) {
		this.webAPI = webAPI
		this.presentation = presentation
	}

	async init() {
		const {
			coefficients,
			winLinesTopologies,
			betsOptions,
			balance,
			currencyCode,
		} = await this.webAPI.gameDescription()

		this.coefficients = coefficients
		this.linesOptions = winLinesTopologies.map((_, i) => i + 1)
		this.balance = balance
		this.currencyCode = currencyCode
		this.linesCount = winLinesTopologies.length
		this.betsOptions = betsOptions
		this.betIndex = 0

		await this.presentation?.init?.({
			initialReels: getRandomLoseReels(),
			currencyCode,
			betsOptions,
			betIndex: this.betIndex,
			linesOptions: this.linesOptions,
			balance,
			coefficients,
			winLinesTopologies
		})
		this.idle()
	}

	async error({errorCode, isFatal = false}) {
		this.payout = 0
		this.winLines = []
		this.presentation?.presentError?.(errorCode)
		await this.presentation?.presentSpinStop?.(getRandomLoseReels())
		isFatal || this.idle()
	}

	changeBet(index) {
		this.betIndex = index
		this.idle()
	}

	changeLinesCount(index) {
		this.linesCount = this.linesOptions[index] ?? this.linesOptions[0]
		this.winLines = []
		this.idle()
	}

	async makeBet({
		betIndex = this.betIndex,
		linesCount = this.linesCount,
		desiredReels,
		riskOption,
		specialSymbolId
	}) {
		const { presentation } = this
		const betPerLine = this.betsOptions[betIndex]
		const betPerAllLines = betPerLine * linesCount
		const balanceBeforePayouts = this.balance - betPerAllLines

		// preventing invalid bet request on client side if possible
		if(this.balance < betPerAllLines)
			return this.error({errorCode: ERROR_CODES.OUT_OF_BALANCE})

		await presentation?.presentSpinStart?.({ // let it spin while fetching
			balance: balanceBeforePayouts})

		const {
			errorCode,
			balance,
			currencyCode,
			steps,
			totalCoefficient,
        	totalPayout,
		} = await this.webAPI.makeBet({
			betPerLine,
			linesCount,
			desiredReels,
			riskOption,
			specialSymbolId
		})

		// retrieving final balance anyways 
		this.balance = balance ?? this.balance

		if (errorCode) return this.error({errorCode})

		let isFreeSpinsMode
		let commonPayout = 0
		let lockedReelsIndexes
		
		for (let i = 0; i < steps.length; i++) {
			const step = steps[i]
			const {
				reels,
				winLines,
				stepPayout = 0,
				stepCoefficient,
				freeSpinsCount,
				awardedFreeSpinsCount = 0,
				specialSymbolId,

				substitutionSymbolId,
				specialWinReels,
				specialWinLines,
				stepSpecialCoefficient,
				stepSpecialPayout = 0
			} = step

			this.winLines = winLines

			// 1st step spin is already started 
			i && await presentation?.presentSpinStart?.({
				balance: balanceBeforePayouts,
				commonPayout,
				freeSpinsCount,
				lockedReelsIndexes,
				lockedSymbolId: reels[4][0],
			})

			await presentation?.presentSpinStop?.(reels)

			lockedReelsIndexes = step.lockedReelsIndexes

			// COMMON PAYOUTS UPDATE...
			commonPayout += stepPayout

			stepPayout
			&& await presentation?.presentWin?.({
				coefficient: stepCoefficient,
				payout: stepPayout,
				winLines,
				currencyCode,
				reels,
				commonPayout,
			})

			if (awardedFreeSpinsCount) {
				if(isFreeSpinsMode) {
					await presentation?.presentFreeSpinsAward?.({
						freeSpinsCount: freeSpinsCount - awardedFreeSpinsCount,
						awardedFreeSpinsCount,
					})
				} else {
					isFreeSpinsMode = true
					await presentation?.presentFreeSpinsModeTransition?.({
						specialSymbolId,
						freeSpinsCount: freeSpinsCount - awardedFreeSpinsCount,
						awardedFreeSpinsCount
					})
				}
			}

			if (stepSpecialCoefficient) {
				commonPayout += stepSpecialPayout
				
				await presentation?.presentSpecialWin?.({
					commonPayout,
					substitutionSymbolId,
					specialWinReels,
					specialWinLines,
					stepSpecialCoefficient,
					stepSpecialPayout,
					reels
				})
			}
		}

		if (isFreeSpinsMode) {
			this.winLines = undefined
			await presentation?.presentFreeSpinsModeTransition?.({
				payout: commonPayout
			})
		} else if (totalPayout) {
			await presentation?.presentTotalWin?.({
				totalCoefficient,
				totalPayout,
				balance
			})
		}

		this.payout = commonPayout

		this.idle()
	}

	makeCheatBet({
		reels,
		riskOption,
		specialSymbolId
	}) {
		return this.makeBet({
			desiredReels: reels,
			riskOption,
			specialSymbolId
		})
	}

	async takeRisk() {
		const { presentation, payout } = this
		const key = await presentation?.getUserRiskChoice?.(payout)
		const actionsMap = {
			'red': () => { this.makeRiskBet(0) },
			'green': () => { this.makeRiskBet(1) },
			'collect': () => { this.idle() },
		}

		if(!actionsMap[key])
			return this.error({
				errorCode: 'Fatal Error, unknown user input',
				isFatal: true
			})

		actionsMap[key]()
	}

	async makeRiskBet(value) {
		const { presentation } = this

		const {
			balance,
			errorCode,
			option,
			coefficient,
			payout
		} = await this.webAPI.makeRisk({riskOption: value})

		if (errorCode) return this.error({errorCode})

		this.balance = balance
		
		// RISK WIN...
		if (coefficient) {
			this.payout = payout

			await presentation?.presentRiskWin?.({
				option,
				balance,
				payout
			})

			return this.takeRisk()
		}
		// ...RISK WIN

		// RISK LOOSE..
		this.payout = 0
		this.winLines = []
		await presentation?.presentRiskLoose?.({
			option,
			balance,
		})
		this.idle()
		// ...RISK LOOSE
	}

	async idle() {
		const {
			betIndex,
			balance,
			currencyCode,
			presentation,
			betsOptions,
			linesCount,
			winLines,
			payout
		} = this
		
		const {
			key,
			value
		} = await presentation?.getUserInput?.({
			betsOptions: betsOptions.map(value => value * linesCount),
			betIndex,
			betPerLine: betsOptions[betIndex],
			linesCount,
			balance,
			currencyCode,
			winLines,
			payout
		}) ?? {}

		const actionsMap = {
			'change_bet': (index) => { this.changeBet(index) },
			'make_bet': () => { this.makeBet({}) },
			'make_cheat_bet': ({
				reels,
				riskOption,
				specialSymbolId
			}) => {
				this.makeCheatBet({
					reels,
					riskOption,
					specialSymbolId
				})
			},
			'change_lines_count': (index) => { this.changeLinesCount(index) },
			'idle': () => { this.idle() },
			'take_risk': () => { this.takeRisk() }
		}

		if(!actionsMap[key])
			return this.error({
				errorCode: 'Fatal Error, unknown user input',
				isFatal: true
			})

		actionsMap[key](value)
	}
}

/**
 * random symbols, no win combinations
 */
function getRandomLoseReels() {
	const randomSymbolsIds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
	const reels = [[], [], [], [], []]

	let availableSymbols = [...randomSymbolsIds]
	for (let x = 0; x < reels.length; x++) {
		for (let y = 0; y < 3; y++) {
			if (!availableSymbols.length)
				availableSymbols = [...randomSymbolsIds]
			
			const randomSymbolIndex = Math.trunc(Math.random() * availableSymbols.length)
			reels[x][y] = availableSymbols[randomSymbolIndex]
			availableSymbols.splice(randomSymbolIndex, 1)
		}
	}

	return reels
}