<script setup>
  import ControlBtns from "../ControlBtns.vue";
  import { formatMoney } from "../../../../Utils";
  import { ref } from "vue"

  const emit = defineEmits([
    'balance',
    'change_bet'
  ])

  const props =  defineProps({
		betsOptions: Array,
    betIndex: Number,
    balance: Number,
		bet: Number,
		win: Number,
    currencyCode: String,
    isLTRTextDirection: Boolean,
    isBetExpected: Boolean,
    isSpinExpected: Boolean,
    isFreeBet: Boolean,
    remainingAutoSpinsCount: Number,
    isFreeSpinsMode: Boolean,
    isSplashScreenMode: Boolean
  })

  const ITEM_HEIGHT = 132
  const LIST_OFFSET = -61
  const selectedBetIndex = ref(0)

  function select(index) {
    document.getElementById('list').scrollTop = - LIST_OFFSET + ITEM_HEIGHT * index
    selectedBetIndex.value = index
  }

  function onScroll() {
    selectedBetIndex.value = Math.trunc((document.getElementById('list').scrollTop + LIST_OFFSET) / ITEM_HEIGHT)
  }

  function confirm() {
    emit('change_bet', selectedBetIndex.value)
  }
</script>

<template>
    <div class="wild-heist-popup wild-heist-popup--bet">
      <div class="wild-heist-popup__header">
        <h2 class="wild-heist-popup__title">Bet options</h2>
        <button class="wild-heist-popup__close"
          @click="emit('close')"
        >
        </button>
      </div>

      <div class="wild-heist-popup__options wild-heist-popup-options">
        <div class="wild-heist-popup-options-headings">
          <p class="wild-heist-popup-options__heading">Bet size</p>
          <p class="wild-heist-popup-options__heading">Bet level</p>
          <p class="wild-heist-popup-options__heading">Base bet</p>
          <p class="wild-heist-popup-options__heading wild-heist-popup-options__heading--gold">Bet amount</p>
        </div>
        <div class="wild-heist-popup-options-columns">
            <ul class="wild-heist-popup-options-column">
              <li class="wild-heist-popup-options-column__num">1</li>
            </ul>

            <p class="wild-heist-popup-options__symbol">x</p>

            <ul class="wild-heist-popup-options-column">
              <li class="wild-heist-popup-options-column__num">1</li>
            </ul>

            <p class="wild-heist-popup-options__symbol">x</p>

            <ul class="wild-heist-popup-options-column">
              <li class="wild-heist-popup-options-column__num">1</li>
            </ul>

            <p class="wild-heist-popup-options__symbol">=</p>

            <ul @scroll="onScroll" id="list" class="wild-heist-popup-options-column">
              <li  v-for="i in betsOptions" class="wild-heist-popup-options-column__num">
                {{
                  formatMoney({
                    value: i,
                    currencyCode,
                    isLTRTextDirection
                  })
                }}
              </li>
            </ul>
        </div>
      </div>

      <div class="wild-heist-popup__bottom wild-heist-popup-bottom">
        <div class="wild-heist-popup-bottom__btns">

          <!-- max bet -->
          <button
            @click="select(betsOptions.length - 1)"
              class="wild-heist-popup-btn"
          >
            <span class="wild-heist-popup-btn__text wild-heist-popup-btn__text--gold">Max Bet</span>
          </button>

          <!-- confirm -->
          <button
            @click="confirm"
            class="wild-heist-popup-btn wild-heist-popup-btn--gold"
          >
            <span class="wild-heist-popup-btn__text">Confirm</span>
          </button>
        </div>
        <div class="wild-heist-popup-bottom__controls">
          <ControlBtns
            :metrics = "{
              y: 1235,
              width: 475,
              height: 50,
              balanceX: 150,
              betX: 810,
              winX: 1450,
            }"
            :balance="balance"
            :bet="bet"
            :win="win"
            :currencyCode="currencyCode"
            :isLTRTextDirection="isLTRTextDirection"
            :isBetExpected="isBetExpected"
            :isSpinExpected="isSpinExpected"
            @balance="emit('balance')"
          />
        </div>
      </div>
    </div>
</template>


<style scoped>
  .wild-heist-popup--bet {
    width: 2000px;
  }
</style>


