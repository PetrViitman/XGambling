import { COEFFICIENTS, SlotMachine, WIN_LINES } from "./slotMachine/SlotMachine"
import PROBABILITY from "./slotMachine/RTP97"

const CUSTOM_REELS_EXPECTED = true
const ERROR_CODES = {
	INTERNAL_ERROR: 100,
	OUT_OF_BALANCE: 200,
	BET_IS_INVALID: 300,
	CUSTOM_REELS_ARE_NOT_EXPECTED: 400,
	CUSTOM_REELS_ARE_INVALID: 401,
	RISK_IS_NOT_EXPECTED: 500,
}
const CURRENCY_CODE = 'FUN'
const BETS_VALUES = [1, 5, 10, 20, 50, 100]

export class FakeServer {
	slotMachine = new SlotMachine(PROBABILITY)
	balance = 10_000

	getBetErrorCode({
		bet,
		betsOptions = BETS_VALUES,
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
	getGameDescription() {
		return this.patchResponse({
			coefficients: COEFFICIENTS,
			winLinesTopologies: WIN_LINES,
			betsOptions: BETS_VALUES,
		})
	}

	makeBet({
		betPerLine = 1,
		linesCount,
		desiredReels,
		riskOption,
		specialSymbolId
	}) {
		const betPerAllLines = betPerLine * linesCount

		const errorCode = this.getBetErrorCode({
			bet: betPerAllLines,
			BETS_VALUES,
			desiredReels
		})
	
		if(errorCode)
			return this.patchResponse({errorCode})
		
		try {
			this.balance -= betPerAllLines
			const { steps, totalCoefficient } = this
				.slotMachine
				.generateSingleGameDescriptor({
					betPerLine,
					linesCount,
					desiredReels: CUSTOM_REELS_EXPECTED && desiredReels,
					riskOption: CUSTOM_REELS_EXPECTED && riskOption,
					presetSpecialSymbolId: CUSTOM_REELS_EXPECTED && specialSymbolId
				})

			const totalPayout = Number((totalCoefficient * betPerAllLines).toFixed(2))

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

	makeRisk(userOption) {
		const { slotMachine } = this

		if(!slotMachine.riskCoefficient)
			return this.patchResponse({errorCode: ERROR_CODES.RISK_IS_NOT_EXPECTED})

		const pendingRiskPayout = slotMachine.riskCoefficient * slotMachine.riskBet

		if(this.balance < pendingRiskPayout)
			return this.patchResponse({errorCode: ERROR_CODES.OUT_OF_BALANCE})
		
		try {
			this.balance -= pendingRiskPayout
			const {
				coefficient,
				payout,
				option
			} = this
				.slotMachine
				.generateRiskGameDescriptor({option: userOption})

			const totalPayout = Number(payout.toFixed(2))

			this.balance += totalPayout

			return this.patchResponse({
				coefficient,
				payout: totalPayout,
				option
			})
		} catch (_) {
			console.log(_)
			return this.patchResponse({errorCode: ERROR_CODES.INTERNAL_ERROR})
		}
	}
	// ...API
}