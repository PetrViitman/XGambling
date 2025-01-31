const ERROR_CODES = { OUT_OF_BALANCE: 200 }

export class GameLogic {
	winLines
	coefficients
	betsOptions = []
	buyFeatureOptions = []
	balance = 0
	currencyCode = ''
	bet

	constructor({webAPI, presentation}) {
		this.presentation = presentation
		this.webAPI = webAPI
	}

	async init() {
		const {
			coefficients,
			winLinesTopologies,
			betsOptions,
			buyFeatureOptions,
			balance,
			currencyCode,
			languageCode,
		} = await this.webAPI.gameDescription()

		this.coefficients = coefficients
		this.betsOptions = betsOptions
		this.buyFeatureOptions = buyFeatureOptions
		this.balance = balance
		this.currencyCode = currencyCode
		this.bet = betsOptions[0]

		await this.presentation?.init?.({
			languageCode,
			initialReels: getRandomLoseReels(),
			currencyCode,
			betsOptions,
			buyFeatureOptions,
			balance,
			bet: this.bet,
			coefficients,
			winLinesTopologies
		})
		this.idle()
	}

	async error({errorCode, isFatal = false}) {
		this.presentation?.presentError?.(errorCode)
		await this.presentation?.presentSpinStop?.(getRandomLoseReels())
		isFatal || this.idle()
	}

	changeBet(index) {
		this.bet = this.betsOptions[index] ?? this.betsOptions[0]
		this.idle()
	}

	async makeBet({
		bet = this.bet,
		buyFeaturePrice,
		desiredReels,
	}) {
		const { presentation } = this
		const finalPrice = buyFeaturePrice ?? bet
		const balanceBeforePayouts = this.balance - finalPrice

		// preventing invalid bet request on client side if possible
		if(this.balance < finalPrice)
			return this.error({errorCode: ERROR_CODES.OUT_OF_BALANCE})

		presentation?.presentMultiplierRecharge?.(-1) // drop
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
			bet,
			buyFeaturePrice,
			isBuyFeatureRequest: !!buyFeaturePrice,
			desiredReels
		})

		// retrieving final balance anyways 
		this.balance = balance ?? this.balance

		if(errorCode) return this.error({errorCode})

		let isFreeSpinsMode
		let commonPayout = 0
		let commonSpinPayout = 0
		let commonDefaultSpinsPayout = 0
		let commonFreeSpinsPayout = 0
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
				expandedReelsLength = 3,
			} = step

			this.winLines = winLines

			const isReSpinStep = !!step.lockedReelsIndexes

			if(!isReSpinStep) {
				commonSpinPayout = 0
			}

			// 1st step spin is already started 
			i && await presentation?.presentSpinStart?.({
				balance: isFreeSpinsMode 
					? balanceBeforePayouts + commonDefaultSpinsPayout
					: balanceBeforePayouts,
				commonPayout: isFreeSpinsMode
					? commonFreeSpinsPayout
					: commonPayout,
				commonFreeSpinsPayout,
				freeSpinsCount,
				lockedReelsIndexes,
				lockedSymbolId: reels[4][0],
			})

			await presentation?.presentSpinStop?.(reels)

			lockedReelsIndexes = step.lockedReelsIndexes

			// COMMON PAYOUTS UPDATE...
			if (isFreeSpinsMode)
				commonFreeSpinsPayout += stepPayout
			else
				commonDefaultSpinsPayout += stepPayout

			commonPayout = (!isReSpinStep || isFreeSpinsMode)
				? commonPayout + stepPayout
				: stepPayout

			commonSpinPayout += stepPayout
			// ...COMMON PAYOUTS UPDATE

			stepPayout
			&& await presentation?.presentWin?.({
				coefficient: stepCoefficient,
				payout: stepPayout,
				winLines,
				currencyCode,
				reels,
				commonPayout: isFreeSpinsMode
					? commonFreeSpinsPayout
					: commonPayout
			})

			if (awardedFreeSpinsCount)
				if(isFreeSpinsMode) {
					await presentation?.presentFreeSpinsAward?.({
						freeSpinsCount: freeSpinsCount + awardedFreeSpinsCount,
						awardedFreeSpinsCount,
					})
					await presentation?.presentExpansion(expandedReelsLength)
				} else {
					isFreeSpinsMode = true
					await presentation?.presentFreeSpinsModeTransition?.({
						freeSpinsCount: awardedFreeSpinsCount,
						awardedFreeSpinsCount
					})
				}
		}

		if (isFreeSpinsMode) {
			this.winLines = undefined
			await presentation?.presentFreeSpinsModeTransition?.({
				commonFreeSpinsPayout
			})
		} else if (totalPayout) {
			await presentation?.presentTotalWin?.({
				totalCoefficient,
				totalPayout,
			})
		}

		this.idle()
	}

	buyFeature(optionIndex) {
		return this.makeBet({
			bet: this.betsOptions[optionIndex],
			buyFeaturePrice: this.buyFeatureOptions[optionIndex]
		})
	}

	makeCheatBet(desiredReels) {
		return this.makeBet({
			bet: this.bet,
			desiredReels: desiredReels
		})
	}

	async idle() {
		const {
			bet,
			balance,
			currencyCode,
			presentation,
			buyFeatureOptions,
			winLines
		} = this
		
		const {
			key,
			value
		} = await presentation?.getUserInput?.({
			bet,
			balance,
			currencyCode,
			winLines,
		}) ?? {}

		const actionsMap = {
			'change_bet': (index) => { this.changeBet(index) },
			'make_bet': () => { this.makeBet({}) },
			'make_cheat_bet': (reels) => { this.makeCheatBet(reels) },
			'buy_bonus': (index) => { this.buyFeature(index) },
			'idle': () => { this.idle() }
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
	const randomSymbolsIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	const reels = [[0], [], [], [], [0]]

	let availableSymbols = [...randomSymbolsIds]
	for (let x = 1; x < reels.length - 1; x++) {
		for (let y = 0; y < 7; y++) {
			if (!availableSymbols.length)
				availableSymbols = [...randomSymbolsIds]
			
			const randomSymbolIndex = Math.trunc(Math.random() * availableSymbols.length)
			reels[x][y] = availableSymbols[randomSymbolIndex]
			availableSymbols.splice(randomSymbolIndex, 1)
		}
	}

	return reels
}