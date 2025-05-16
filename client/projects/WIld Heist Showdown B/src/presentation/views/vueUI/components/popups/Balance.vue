<script setup>

  import SVG from "../svg/SVG.vue";
  import ControlBtns from "../ControlBtns.vue";
  import {computed} from "vue"
  import { formatMoney } from "../../../../Utils";

  const props =  defineProps({
    betsOptions: Array,
    betIndex: Number,
    balance: Number,
		bet: Number,
		win: Number,
    currencyCode: String,
    isLTRTextDirection: Boolean
  })

  const emit = defineEmits([
    'bet'
  ])

  const formattedBalance = computed({
    get() {
      return formatMoney({
        value: props.balance,
        currencyCode: props.currencyCode,
        isLTRTextDirection: props.isLTRTextDirection
      })
    }
  })
</script>

<template>
  <div class="wild-heist-popup-layout test">
    <div class="wild-heist-popup wild-heist-popup--balance">
      <div class="wild-heist-popup__header">
        <h2 class="wild-heist-popup__title">Balance</h2>
        <button class="wild-heist-popup__close"
          @click = "emit('close')"
        >
        </button>
      </div>

      <div class="wild-heist-balance">
          <div class="wild-heist-balance__name wild-heist-balance-name">
            <div class="wild-heist-balance-name__ico">
              <SVG
                  :spriteName="'wallet'"
                  width="60"
                  height="60"
              />
            </div>
            <p class="wild-heist-balance-name__text">Cash Wallet</p>
          </div>
          <p class="wild-heist-balance__sum">100,000.00</p>
      </div>
      <div class="wild-heist-balance">
          <div class="wild-heist-balance__name wild-heist-balance-name">
            <div class="wild-heist-balance-name__ico">
              <SVG
                  :spriteName="'wallet'"
                  width="60"
                  height="60"
              />
            </div>
            <p class="wild-heist-balance-name__text">Cash Wallet</p>
          </div>
          <p class="wild-heist-balance__sum">100,000.00</p>
      </div>

      <div class="wild-heist-popup__bottom wild-heist-popup-bottom">
        <div class="wild-heist-popup-bottom__btns">

          <!-- max bet -->
          <button
              class="wild-heist-popup-btn"
          >
            <span class="wild-heist-popup-btn__text wild-heist-popup-btn__text--gold">Max Bet</span>
          </button>

          <!-- confirm -->
          <button
              class="wild-heist-popup-btn wild-heist-popup-btn--gold"
          >
            <span class="wild-heist-popup-btn__text">Confirm</span>
          </button>
        </div>
        <div class="wild-heist-popup-bottom__controls">
          <ControlBtns
          :balance="balance"
          :bet="bet"
          :win="win"
          :currencyCode="currencyCode"
          :isLTRTextDirection="isLTRTextDirection"
          :isBetExpected="isBetExpected"
          :isSpinExpected="isSpinExpected"
          :metrics = "{
            y: 945,
            width: 275,
            height: 50,
            balanceX: 140,
            betX: 560,
            winX: 975,
          }"
          @bet="emit('bet')"
          />
        </div>
      </div>
    </div>
  </div>

</template>


<style scoped>
  .test {
    width: 1300px;
  }
</style>

