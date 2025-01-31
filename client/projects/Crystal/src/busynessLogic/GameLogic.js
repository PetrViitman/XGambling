const ERROR_CODES = { OUT_OF_BALANCE: 200 }

export class GameLogic {
	payout
	coefficients
	betsOptions = []
	balance = 0
	currencyCode = ''
	betIndex
	webAPI

	constructor({webAPI, presentation}) {
		this.webAPI = webAPI
		this.presentation = presentation
	}

	async init() {
		const {
			coefficients,
			betsOptions,
			balance,
			currencyCode,
		} = await this.webAPI.gameDescription()

		this.coefficients = coefficients
		this.balance = balance
		this.currencyCode = currencyCode
		this.betsOptions = betsOptions
		this.betIndex = 0

		await this.presentation?.init?.({
			currencyCode,
			betsOptions,
			betIndex: this.betIndex,
			balance,
			coefficients,
		})
		this.idle()

	}

	async error({errorCode, isFatal = false}) {
		this.payout = 0
		this.presentation?.presentError?.(errorCode)
		await this.presentation?.presentSpinStop?.()
		isFatal || this.idle()
	}

	changeBet(index) {
		this.betIndex = index
		this.idle()
	}

	async makeBet({
		betIndex = this.betIndex,
		desiredReels
	}) {
		const { presentation } = this
		const bet = this.betsOptions[betIndex]
		const balanceBeforePayouts = this.balance - bet
		// preventing invalid bet request on client side if possible
		if(this.balance < bet)
			return this.error({errorCode: ERROR_CODES.OUT_OF_BALANCE})

		await presentation?.presentSpinStart?.({ // let it spin while fetching
			balance: balanceBeforePayouts,
		})

		const {
			errorCode,
			balance,
			currencyCode,
			steps,
			totalCoefficient,
        	totalPayout
		} = await this.webAPI.makeBet({
			desiredReels,
			bet,
		})

		// retrieving final balance anyways 
		this.balance = balance ?? this.balance

		if (errorCode) return this.error({errorCode})

		let commonPayout = 0
		
		for (let i = 0; i < steps.length; i++) {
			const step = steps[i]
			const {
				reels,
				collapses,
				reelsPatch
			} = step


			const isSpinStep = !!reels

			if(isSpinStep) {
				// 1st step spin is already started 
				i && await presentation?.presentSpinStart?.({
					balance: balanceBeforePayouts,
					commonPayout,
					currencyCode,
				})

				await presentation?.presentSpinStop?.(reels)

			}

			// COMMON PAYOUTS UPDATE...
			// DEBUG...
			const stepPayout = step.payout ?? 0
			const stepCoefficient = step.coefficient ?? 1
			// ...DEBUG

			commonPayout += stepPayout

			if (stepPayout) {
				await presentation?.presentWin?.({
					coefficient: stepCoefficient,
					payout: stepPayout,
					commonPayout,
					currencyCode
				})
			} else {
				await presentation?.presentLose?.()
			}

			reelsPatch
			&& await Promise.all([
				presentation?.presentCascade?.({
					collapses,
					patchMap: reelsPatch,
				})
			])
		}

		if (totalPayout) {
			await presentation?.presentTotalWin?.({
				totalCoefficient,
				totalPayout,
				currencyCode
			})
		}

		this.payout = totalPayout

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

	async idle() {
		const {
			betIndex,
			balance,
			currencyCode,
			presentation,
			betsOptions,
			payout
		} = this
		
		const {
			key,
			value
		} = await presentation?.getUserInput?.({
			betsOptions,
			betIndex,
			bet: betsOptions[betIndex],
			balance,
			currencyCode,
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
			'idle': () => { this.idle() },
		}

		if(!actionsMap[key])
			return this.error({
				errorCode: 'Fatal Error, unknown user input',
				isFatal: true
			})

		actionsMap[key](value)
	}
}
