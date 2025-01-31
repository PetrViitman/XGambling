import { COEFFICIENTS, SlotMachine, WIN_LINES } from "./slotMachine/SlotMachine"
import PROBABILITY from "./slotMachine/RTP97"

const CUSTOM_REELS_EXPECTED = true
const ERROR_CODES = {
	INTERNAL_ERROR: 100,
	OUT_OF_BALANCE: 200,
	BET_IS_INVALID: 300,
	CUSTOM_REELS_ARE_NOT_EXPECTED: 400,
	CUSTOM_REELS_ARE_INVALID: 401,
}
const CURRENCY_CODE = 'FUN'
const BETS_OPTIONS = [1, 5, 10, 20, 50, 100]
const BUY_FEATURE_BET_MULTIPLIER = 80
const BUY_FEATURE_OPTIONS = BETS_OPTIONS.map(value => value * BUY_FEATURE_BET_MULTIPLIER)
const SCATTER_SYMBOL_ID = 9
const DEFAULT_SYMBOLS_IDS = [1, 2, 3, 4, 5, 6, 7, 8]

export const DEFAULT_REEL_POSSIBLE_IDS = [...DEFAULT_SYMBOLS_IDS, SCATTER_SYMBOL_ID]
export const WILD_REEL_POSSIBLE_IDS = [...DEFAULT_REEL_POSSIBLE_IDS, 11, 22, 33, 44, 55]
export const POSSIBLE_REELS_IDS = [
	DEFAULT_REEL_POSSIBLE_IDS,
	WILD_REEL_POSSIBLE_IDS,
	WILD_REEL_POSSIBLE_IDS,
	WILD_REEL_POSSIBLE_IDS,
	DEFAULT_REEL_POSSIBLE_IDS,
]

export class FakeServer {
	slotMachine = new SlotMachine(PROBABILITY)
	balance = 10000

	getBetErrorCode({
		bet,
		betsOptions = BETS_OPTIONS,
	}) {
		if(!betsOptions.includes(bet)) {
			return ERROR_CODES.INVALID_BET
		}

		if(this.balance < bet)
			return ERROR_CODES.OUT_OF_BALANCE
	}

	patchResponse(response) {
		return {
			...response,
			balance: Number(this.balance.toFixed(2)),
			currencyCode: CURRENCY_CODE,
		}
	}

	// API...
	gameDescription() {
		return this.patchResponse({
			coefficients: COEFFICIENTS,
			winLinesTopologies: WIN_LINES,
			betsOptions: BETS_OPTIONS,
			buyFeatureOptions: BUY_FEATURE_OPTIONS,
		})
	}

	makeBet({
		bet = 10,
		buyFeaturePrice,
		desiredReels,
	}) {
		const finalPrice = buyFeaturePrice ?? bet

		if (buyFeaturePrice) {
			const errorCode = this.getBetErrorCode(
				buyFeaturePrice,
				BUY_FEATURE_OPTIONS
			)
			if(errorCode)
				return this.patchResponse({errorCode})
		}

		const errorCode = this.getBetErrorCode({bet, BETS_OPTIONS, desiredReels})
	
		if(errorCode)
			return this.patchResponse({errorCode})
		
		try {
			this.balance -= finalPrice
			const { steps, totalCoefficient } = this
				.slotMachine
				.generateSingleGameDescriptor({
					bet,
					desiredReels: CUSTOM_REELS_EXPECTED && desiredReels,
					isFreeSpinsAwardPurchased: !!buyFeaturePrice
				})

			const totalPayout = Number((totalCoefficient * bet).toFixed(2))
			this.balance += totalPayout

			return this.patchResponse({
				totalCoefficient,
				totalPayout,
				steps
			})
		} catch (_) {
			console.log(_)
			return this.patchResponse({errorCode: ERROR_CODES.INTERNAL_ERROR})
		}
	}
	// ...API
}