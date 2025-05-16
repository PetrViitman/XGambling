import { COEFFICIENTS, SlotMachine } from "./slotMachine/SlotMachine"
import PROBABILITY from "./slotMachine/ProbabilityTemplate"

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
const MINIMAL_BET = 1
const MAXIMAL_BET =	413

const BUY_FEATURE_BET_MULTIPLIER = 75

const ACCOUNTS = [
    {
        "type": 0,
        "name": "Main account",
        "id": 476313101,
        "balance": 6540.36,
        "currencyId": 1,
        "codeCurrency": "RUB",
        "isPrimary": true,
        "isActive": true,
        "currency": {
            "id": 1,
            "code": "RUB"
        }
    },
    {
        "type": 13,
        "name": "1xGames bonus account",
        "id": 476415627,
        "balance": 1015.5,
        "currencyId": 1,
        "codeCurrency": "RUB",
        "isPrimary": false,
        "isActive": false,
        "currency": {
            "id": 1,
            "code": "RUB"
        }
    },
    {
        "type": 9,
        "name": "Other currencies",
        "id": 566165121,
        "balance": 613.35,
        "currencyId": 12,
        "codeCurrency": "EUR",
        "isPrimary": false,
        "isActive": false,
        "currency": {
            "id": 12,
            "code": "EUR"
        }
    },
    {
        "type": 9,
        "name": "Other currencies",
        "id": 566165159,
        "balance": 493.61,
        "currencyId": 10,
        "codeCurrency": "USD",
        "isPrimary": false,
        "isActive": false,
        "currency": {
            "id": 10,
            "code": "USD"
        }
    },
    {
        "type": 9,
        "name": "Other currencies",
        "id": 566165211,
        "balance": 94711480,
        "currencyId": 31,
        "codeCurrency": "IRR",
        "isPrimary": false,
        "isActive": false,
        "currency": {
            "id": 31,
            "code": "IRR"
        }
    },
    {
        "type": 9,
        "name": "Other currencies",
        "id": 566165353,
        "balance": 10,
        "currencyId": 25,
        "codeCurrency": "mBT",
        "isPrimary": false,
        "isActive": false,
        "currency": {
            "id": 25,
            "code": "mBT"
        }
    }
]

/*
const ACCOUNTS = [
    {
        "type": 0,
        "name": '',
        "id": -1,
        "balance": 0,
        "currencyId": 1,
        "codeCurrency": "",
        "isPrimary": true,
        "isActive": true,
        "currency": {
            "id": 1,
            "code": ""
        }
    }
]*/

const BONUSES = [
    {
        "BNID": 2696758,
        "BNTP": 3,
        "BC": "Бесплатная ставка по игре ABC на сумму 1 Евро",
        "GID": 1000,
        "FBSE": 1,
        "CNT": 40,
        "TLM": 9399
    },
    {
        "BNID": 2696758,
        "BNTP": 3,
        "BC": "Бесплатная ставка по игре Wild Heist Showdown на сумму 1 Евро",
        "GID": 578,
        "FBSE": 1,
        "CNT": 40,
        "TLM": 9399
    },
    {
        "BNID": 2696758,
        "BNTP": 3,
        "BC": "Бесплатная ставка по игре TEST на сумму 1 Евро",
        "GID": 600,
        "FBSE": 1,
        "CNT": 40,
        "TLM": 9399
    }
]


function getCurrentAccount() {
	for(let i = 0; i < ACCOUNTS.length; i++ ){
		if(ACCOUNTS[i].isActive) return ACCOUNTS[i]
	}
}

export class FakeServer {
	slotMachine = new SlotMachine(PROBABILITY)
	balance = getCurrentAccount().balance;

	getBetErrorCode(bet) {
		if(bet < MINIMAL_BET)
			return ERROR_CODES.INVALID_BET

		if(bet > MAXIMAL_BET)
			return ERROR_CODES.INVALID_BET

		if(this.balance < bet)
			return ERROR_CODES.OUT_OF_BALANCE
	}

	patchResponse(response) {
		return {
			...response,
			balance: Number(this.balance.toFixed(2)),
			currencyCode: getCurrentAccount().currency.code,
		}
	}

	// API...
	getGameDescription() {
		return this.patchResponse({
			coefficients: COEFFICIENTS,
			minimalBet: MINIMAL_BET,
			maximalBet: MAXIMAL_BET,
			accounts: ACCOUNTS,
			buyFeatureBetMultiplier: BUY_FEATURE_BET_MULTIPLIER
		})
	}

	getGameBonuses() {
		return this.patchResponse({
			bonuses: BONUSES,
		})
	}

	switchAccount(accountId) {
		ACCOUNTS.forEach(account => {
			account.isActive = account.id === accountId
		})

		this.balance = getCurrentAccount().balance


		return this.patchResponse({
			minimalBet: MINIMAL_BET,
			maximalBet: MAXIMAL_BET,
			accounts: ACCOUNTS,
			balance: this.balance,
		})
	}

	makeBet({
		bet = 1,
		desiredReels,
		isBuyFeatureRequest
	}) {

		const multipliedBet = isBuyFeatureRequest ? bet * BUY_FEATURE_BET_MULTIPLIER : bet
		const errorCode = this.getBetErrorCode(multipliedBet)
	
		if(errorCode)
			return this.patchResponse({errorCode})
		
		try {
			this.balance -= multipliedBet
			getCurrentAccount().balance = this.balance

			const {
				steps,
				totalCoefficientBeforeMultiplier,
				totalCoefficient,
			} = this
				.slotMachine
				.generateSingleGameDescriptor({
					bet,
					desiredReels: CUSTOM_REELS_EXPECTED && desiredReels,
					isBonusPurchased: isBuyFeatureRequest
				})


			const result = {
				steps,
				totalCoefficient,
				totalPayout: Number((totalCoefficient * bet).toFixed(2)),
			}

			if (totalCoefficientBeforeMultiplier < totalCoefficient) {
				result.totalCoefficientBeforeMultiplier = totalCoefficientBeforeMultiplier
				result.totalPayoutBeforeMultiplier = Number((totalCoefficientBeforeMultiplier * bet).toFixed(2))
			}
			
			this.balance += result.totalPayout
			getCurrentAccount().balance = this.balance

			return this.patchResponse(result)

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
			getCurrentAccount().balance = this.balance;

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