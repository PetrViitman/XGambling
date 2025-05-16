import {
	makeGameDescriptionRequest,
	makeBetRequest,
	switchAccount,
	getGameBonuses,
} from "./webAPI/WebAPI"

const ERROR_CODES = { OUT_OF_BALANCE: 200 }


export class GameLogic {
	payout
	winMap
	coefficients
	betsOptions = []
	balance = 0
	currencyCode = ''
	bet
	minimalBet
	maximalBet
	multiplier = 1
	accounts
	accountId
	activeBonusDescriptor
	buyFeatureBetMultiplier = 1

	constructor(presentation) {
		this.presentation = presentation
	}

	updateBetsOptions(recommendedBet) {
		const {
			minimalBet,
			maximalBet,
		} = this

		const betsOptions = [minimalBet]
		const maximalBetString = Math.trunc(maximalBet) + ''
		const maximalBetLength = maximalBetString.length
		const prettierMaximalBet =
		  Math.round(maximalBet / 10 ** (maximalBetLength - 1)) * 10 ** (maximalBetLength - 1)
		
		const betStep = Math.max(10, prettierMaximalBet / 50)

		let bet = Math.max(betStep, minimalBet)
		if (bet === minimalBet) {
			bet += betStep
		}
		while (bet < maximalBet) {
			betsOptions.push(bet)
			bet += betStep
		}

		betsOptions.push(maximalBet)
		
		
		this.betsOptions = betsOptions
		this.bet = recommendedBet ?? this.betsOptions[1]
	}

	async init() {
		const {
			coefficients,
			minimalBet,
			maximalBet,
			balance,
			currencyCode,
			accounts,
			buyFeatureBetMultiplier
		} = await makeGameDescriptionRequest()

		this.coefficients = coefficients
		this.balance = balance
		this.currencyCode = currencyCode
		this.accounts = accounts
		this.minimalBet = minimalBet
		this.maximalBet = maximalBet
		this.buyFeatureBetMultiplier = buyFeatureBetMultiplier
		this.updateBetsOptions(this.recommendedBetSum)

		await this.presentation?.init?.({
			currencyCode,
			betsOptions: this.betsOptions,
			bet: this.bet,
			minimalBet,
			maximalBet,
			balance,
			coefficients,
			accounts,
			buyFeatureBetMultiplier
		})

		this.idle()
	}

	async error({errorCode, isFatal = false}) {
		this.payout = 0
		this.winMap = []
		this.presentation?.presentError?.(errorCode)
		await this.presentation?.presentSpinStop?.({})
		isFatal || this.idle()
	}

	changeBet(bet) {
		this.bet = bet
		this.idle()
	}

	async changeAccount(account) {
		this.accounts.forEach(account => account.isActive = false)
		account.isActive = true
		this.presentation?.presentNetworkResponseAwait?.()
		this.activeBonusDescriptor = undefined

		const {
			accounts,
			minimalBet,
			maximalBet,
			currencyCode,
			balance,
		} = await switchAccount(account.id)

		this.accounts = accounts
		this.minimalBet = minimalBet
		this.maximalBet = maximalBet
		this.currencyCode = currencyCode
		this.balance = balance
		this.updateBetsOptions()

		this.idle()
	}


	async requestBonuses() {
		
		this.presentation?.presentNetworkResponseAwait?.()
		const {
			bonuses,
		} = await getGameBonuses()

		await this.presentation?.presentBonuses?.(bonuses)

		this.idle()
	}

	triggerBonus(bonusDescriptor) {
		//{name: 'game', params: {id: number, bonus?: {type: 1 | 2 | 3, id: number}, demo?: 0 | 1 | 2}}

		this.activeBonusDescriptor = bonusDescriptor
		this.idle()
	}

	async makeBet({
		bet = this.bet,
		desiredReels,
		isBuyFeatureRequest
	}) {
		const { presentation, buyFeatureBetMultiplier } = this
		const multipliedBet = isBuyFeatureRequest ? (bet * buyFeatureBetMultiplier) : bet
		const balanceBeforePayouts = Math.max(0, this.balance - multipliedBet)

		// preventing invalid bet request on client side if possible
		if(this.balance < multipliedBet)
			return this.error({errorCode: ERROR_CODES.OUT_OF_BALANCE})

		await presentation?.presentSpinStart?.({ // let it spin while fetching
			balance: balanceBeforePayouts,
			multiplier: this.multiplier,
			currencyCode: this.currencyCode
		})

		const {
			errorCode,
			balance,
			currencyCode,
			steps,
			totalCoefficient,
        	totalPayout,
		} = await makeBetRequest({
			desiredReels,
			bet,
			isBuyFeatureRequest,
		})

		// retrieving final balance anyways 
		this.balance = balance

		if (errorCode) return this.error({errorCode})

		let isFreeSpinsMode
		let commonPayout = 0
		this.multiplier = 1

		
		/*
		steps.forEach((step, i) => {
			const {
				reels,
				winMap,
				reelsPatch
			} = step

			// бекендер не захотел помечать минусом такие вины,
			// т.к. у меня помечаются, здесь откатываю, как у него чтоб было
			winMap?.forEach(reel => reel.forEach((value, y) => reel[y] = Math.abs(value)))

			// EXCESS REELS PATCH REMOVAL...
			// бекенд разработчик упорно засылает дополнительные символы (пустой массив),
			// даже если не было коллапсов
			// чтобы не возникло путаницы, пустой reelsPatch здесь обнуляется
			let isRedundantReelsPatch = true
			for (let x = 0; x < reelsPatch.length; x++) {
				if(reelsPatch[x].length > 0) {
					isRedundantReelsPatch = false
					break
				}
			}

			if(isRedundantReelsPatch) {
				step.reelsPatch = undefined
			}
			// ...EXCESS REELS PATCH REMOVAL

			// EXCESS WIN MAP REMOVAL...
			// бекенд разработчик упорно засылает карты выигрышей даже на проигрыш (пустые)
			// чтобы не возникло путаницы, пустые винмапы здесь приходится подчистить
			let isRedundantWinMap= true
			for (let x = 0; x < winMap.length; x++) {
				if(winMap[x].includes(1)) {
					isRedundantWinMap = false
					break
				}
			}

			if(isRedundantWinMap) {
				step.winMap = undefined
			}
			// ...EXCESS WIN MAP REMOVAL


			// EXCESS REELS REMOVAL...
			// бекенд разработчик упорно засылает колёса даже на каскад
			// чтобы не возникло путаницы, спин это, или каскад, приходится
			// подчистить тут
			const previousStep = steps[i - 1]
			if(previousStep && previousStep.reelsPatch) {
				step.reels = undefined
			}
			// ...EXCESS REELS REMOVAL
			// ...FORCE REMOVE EXCESS REELS FROM CASCADE STEP
		})
		*/

		for (let i = 0; i < steps.length; i++) {
			const step = steps[i]
			const {
				reels,
				winMap,
				reelsPatch,
				freeSpinsCount,
				awardedFreeSpinsCount = 0,
			} = step

			const stepPayout = step.payout ?? 0
			const stepCoefficient = step.coefficient ?? 1
			// бекендер не захотел помечать минусом такие вины,
			// т.к. у меня помечаются, здесь откатываю, как у него чтоб было
			winMap?.forEach(reel => reel.forEach((value, y) => reel[y] = Math.abs(value)))

			this.winMap = winMap

			if(reels) {
				// 1st step spin is already started 
				i && await presentation?.presentSpinStart?.({
					balance: balanceBeforePayouts,
					commonPayout,
					freeSpinsCount,
					currencyCode,
					multiplier: this.multiplier
				})

				this.multiplier = isFreeSpinsMode ? 8 : 1

				await presentation?.presentSpinStop?.({
					targetSymbols: reels,
					payout: stepPayout || awardedFreeSpinsCount,
					isBonusPurchased: !i && isBuyFeatureRequest
				})
			}

			commonPayout += stepPayout
			if (stepPayout) {
				await presentation?.presentWin?.({
					coefficient: stepCoefficient,
					payout: stepPayout,
					commonPayout,
					currencyCode,
				})
			} else if (
				!isFreeSpinsMode
				&& !awardedFreeSpinsCount
			) {
				await presentation?.presentLose?.()
			}

			if(reelsPatch) {
				await Promise.all([
					presentation?.presentCascade?.({
						payout: stepPayout,
						currencyCode,
						coefficient: stepCoefficient,
						corruptionMap: winMap,
						patchMap: reelsPatch,
						multiplier: this.multiplier
					})
				])
			}

			if (stepPayout) {
				this.multiplier *= 2
			}

			if (awardedFreeSpinsCount) {
				if(isFreeSpinsMode) {
					await presentation?.presentFreeSpinsAward?.({
						freeSpinsCount: freeSpinsCount + awardedFreeSpinsCount,
						awardedFreeSpinsCount,
					})
				} else {
					isFreeSpinsMode = true
					await presentation?.presentTransitionToBonusGame?.({
						awardedFreeSpinsCount,
						multiplier: this.multiplier
					})

					this.multiplier = 8
				}
			}
		}

		if (isFreeSpinsMode) {
			this.winMap = undefined
			await presentation?.presentTransitionToDefaultGame?.({
				payout: totalPayout,
				currencyCode,
				balance,
				multiplier: this.multiplier
			})
			this.multiplier = 1
		} else if (totalPayout) {
			await presentation?.presentTotalWin?.({
				totalCoefficient,
				totalPayout,
				currencyCode,
				balance
			})
		}

		this.payout = totalPayout
		this.activeBonusDescriptor = undefined

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
			bet,
			balance,
			currencyCode,
			presentation,
			betsOptions,
			winMap,
			payout,
			minimalBet,
			maximalBet,
			activeBonusDescriptor,
			accounts
		} = this
		
		const {
			key,
			value
		} = await presentation?.getUserInput?.({
			betsOptions,
			bet,
			balance,
			winMap,
			payout,
			currencyCode,
			minimalBet,
			maximalBet,
			activeBonusDescriptor,
			accounts
		}) ?? {}

		const actionsMap = {
			'change_bet': (bet) => { this.changeBet(bet) },
			'change_account': (account) => { this.changeAccount(account) },
			'trigger_bonus': (bonusDescriptor) => { this.triggerBonus(bonusDescriptor) },
			'make_bet': () => { this.makeBet({}) },
			'buy_feature': () => { this.makeBet({isBuyFeatureRequest: true}) },
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
			'request_bonuses': () => { this.requestBonuses() },
			'idle': () => { this.idle() },
			'home': () => { this.idle() },
			'request_sign_in': () => { this.idle() }
		}

		if(!actionsMap[key])
			return this.error({
				errorCode: 'Fatal Error, unknown user input',
				isFatal: true
			})

		actionsMap[key](value)
	}
}
