const ERROR_CODES = { OUT_OF_BALANCE: 200 }

export class GameLogic {
	coefficients
	betsOptions = []
	buyFeatureOptions = []
	balance = 0
	currencyCode = ''
	bet

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
			betsOptions,
			buyFeatureOptions,
			balance,
			currencyCode,
		} = await this.webAPI.gameDescription()

		this.coefficients = coefficients
		this.betsOptions = betsOptions
		this.buyFeatureOptions = buyFeatureOptions
		this.balance = balance
		this.currencyCode = currencyCode
		this.bet = betsOptions[0]

		await this.presentation?.init?.({
			initialReels: getRandomLoseReels(),
			currencyCode,
			betsOptions,
			buyFeatureOptions,
			balance,
			bet: this.bet,
			coefficients
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

		for (let i = 0; i < steps.length; i++) {
			const step = steps[i]
			const {
				reels,
				isReSpin,
				winMap,
				payout = 0,
				multiplier,
				harvestedCapacity,
				coefficient,
				reelsPatch,
				freeSpinsCount = 0,
				awardedFreeSpinsCount = 0,
			} = step

			const isSpinStep = !!reels

			if(isSpinStep) {
				commonSpinPayout = 0

				// 1st step spin is allready started 
				i && await presentation?.presentSpinStart?.({
					isReSpin,
					balance: isFreeSpinsMode 
						? balanceBeforePayouts + commonDefaultSpinsPayout
						: balanceBeforePayouts,
					commonPayout: isReSpin ? commonPayout : 0,
					commonFreeSpinsPayout,
					freeSpinsCount,
				})

				await presentation?.presentSpinStop?.(reels)
			}

			// COMMON PAYOUTS UPDATE...
			if (isFreeSpinsMode)
				commonFreeSpinsPayout += payout
			else
				commonDefaultSpinsPayout += payout

			commonPayout = (!isSpinStep || isReSpin || isFreeSpinsMode)
				? commonPayout + payout
				: payout

			commonSpinPayout += payout
			// ...COMMON PAYOUTS UPDATE

			payout
			&& await presentation?.presentWin?.({
				winMap,
				payout,
				currencyCode,
				multiplier,
				coefficient,
				commonPayout: isFreeSpinsMode
					? commonSpinPayout
					: commonPayout
			})

			reelsPatch
			&& await Promise.all([
				presentation?.presentMultiplierRecharge?.(harvestedCapacity),
				presentation?.presentCascade?.({
					corruptionMap: winMap,
					patchMap: reelsPatch
				})
			])

			if (awardedFreeSpinsCount)
				if(isFreeSpinsMode) {
					await presentation?.presentFreeSpinsAward?.({
						freeSpinsCount: freeSpinsCount + awardedFreeSpinsCount,
						awardedFreeSpinsCount
					})
				} else {
					isFreeSpinsMode = true
					await presentation?.presentMultiplierRecharge?.(-1)
					await presentation?.presentFreeSpinsModeTransition?.({
						freeSpinsCount: awardedFreeSpinsCount,
						awardedFreeSpinsCount
					})
				}
		}

		if (isFreeSpinsMode)
			await presentation?.presentFreeSpinsModeTransition?.({
				commonFreeSpinsPayout
			})
		else if (totalPayout)
			await presentation?.presentTotalWin?.({
				totalCoefficient,
				totalPayout,
			})

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
		} = this
		
		const {
			key,
			value
		} = await presentation?.getUserInput?.({
			bet,
			balance,
			currencyCode,
		}) ?? {}

		const actionsMap = {
			'change_bet': (index) => { this.changeBet(index) },
			'make_bet': () => { this.makeBet({}) },
			'make_cheat_bet': (reels) => { this.makeCheatBet(reels) },
			'buy_bonus': (index) => { this.buyFeature(index) }
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
	const randomSymbolsIds = [1, 2, 3, 4, 5, 6, 7]
	const reels = []

	let availableSymbols = [...randomSymbolsIds]
	for (let x = 0; x < 5; x++) {
		reels[x] = []
		for (let y = 0; y < 4; y++) {
			if (!availableSymbols.length)
				availableSymbols = [...randomSymbolsIds]
			
			const randomSymbolIndex = Math.trunc(Math.random() * availableSymbols.length)
			reels[x][y] = availableSymbols[randomSymbolIndex]
			availableSymbols.splice(randomSymbolIndex, 1)
		}
	}

	return reels
}