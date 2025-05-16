<script setup>
  import ControlBtns from "../ControlBtns.vue";
  import {computed, ref} from "vue"
  import {formatMoney} from "../../../../Utils";
  import TextField from '../TextField.vue'
  
  const props =  defineProps({
    betsOptions: Array,
    betIndex: Number,
    balance: Number,
		bet: Number,
		win: Number,
    currencyCode: String,
    isLTRTextDirection: Boolean,
    isTurboMode: Boolean
  })

  const emit = defineEmits([
    'close',
    'balance',
    'bet',
    'turbo',
    'limit',
    'auto'
  ])

  const multiplier = ref(0.5)

  const formattedBalance = computed({
    get() {
      return formatMoney({
        value: props.balance * multiplier.value,
        currencyCode: props.currencyCode,
        isLTRTextDirection: props.isLTRTextDirection
      })
    }
  })

  const sliderValue = ref(100 * multiplier.value)
  function onInput(event) {
    sliderValue.value = event.target.value
    multiplier.value = sliderValue.value / 100
    emit('limit', multiplier.value * props.balance)
  }
</script>

<template>
    <div class="wild-heist-popup wild-heist-popup--autogame">
      <div class="wild-heist-popup__header">
        <h2 class="wild-heist-popup__title">Автоигра</h2>
        <button class="wild-heist-popup__close"
          @click="emit('close')"
        >
        </button>
      </div>
      <h3 class="wild-heist-popup__subtitle">Вращений в автоигре</h3>
      <div class="wild-heist-popup__content">
        <div class="wild-heist-bets">
          <button class="wild-heist-bets-btn wild-heist-bets__btn"><span class="wild-heist-bets-btn__text">5</span></button>
          <button class="wild-heist-bets-btn wild-heist-bets__btn"><span class="wild-heist-bets-btn__text">10</span></button>
          <button class="wild-heist-bets-btn wild-heist-bets__btn"><span class="wild-heist-bets-btn__text">50</span></button>
          <button class="wild-heist-bets-btn wild-heist-bets__btn"><span class="wild-heist-bets-btn__text">100</span></button>
          <input type="number" class="wild-heist-bets-input">
        </div>
        <div class="wild-heist-popup__settings">
          <div class="wild-heist-popup-setting">
            <div class="wild-heist-popup-setting__head">
              <p class="wild-heist-popup-setting__name">
                Остановить при уменьшении суммы денег на
                <span class="wild-heist-popup-setting__required">*Необходимо</span>
              </p>
              <span class="wild-heist-popup-setting__value">
                <TextField
                  style="left: 1050px; top: 579px"
                  class="balance"
                  :maximalWidth="230"
                  :maximalHeight="50"
                  :layoutX="'center'"
                  :layoutY="'middle'"
                  >
                  {{formattedBalance}}
                </TextField>
              </span>
            </div>
            <div class="wild-heist-popup-setting__slider">
              <input
                  id="valueInput"
                  type="range"
                  :value="sliderValue"
                  @input="onInput"
                  min="1"
                  max="100"
                  class="wild-heist-popup-slider__input"
              >
            </div>
          </div>

          <!-- если выбран турбоспин -->

          <!--
            <div class="wild-heist-popup-setting">
              <div class="wild-heist-popup-setting-head">
                <p class="wild-heist-popup-setting-name">
                  Остановить при увеличении суммы денег на
                </p>
                <p class="wild-heist-popup-setting-value">Нет</p>
              </div>
              <div class="wild-heist-popup-setting-slider">
                <input
                  type="range"
                  min="1" max="100"
                  class="wild-heist-popup-slider__input"
                  id="valueInput"
                >
              </div>
            </div>
            <div class="wild-heist-popup-setting">
              <div class="wild-heist-popup-setting-head">
                <p class="wild-heist-popup-setting-name">
                  Если единичный выигрыш превысит
                </p>
                <p class="wild-heist-popup-setting-value">Нет</p>
              </div>
              <div class="wild-heist-popup-setting-slider">
                <input type="range" min="1" max="100" value="50" class="wild-heist-popup-slider__input" id="valueInput">
              </div>
            </div>
          -->
        </div>
        <div class="wild-heist-autogame">
          <div class="wild-heist-autogame__info">
            <p class="wild-heist-autogame__title">turbo spin</p>
            <p class="wild-heist-autogame__text">Играть быстрее, уменьшив общее время спина </p>
          </div>

          <!-- класс wild-heist-turbospin--is-active для переключения тумблера -->
          <button
            class="wild-heist-turbospin"
            :class="{ 'wild-heist-turbospin--is-active': !isTurboMode }"
            @click="emit('turbo')"
            >
            <span class="wild-heist-turbospin__thumb"></span>
            <span class="wild-heist-turbospin__text wild-heist-turbospin__text--off">off</span>
            <span class="wild-heist-turbospin__text wild-heist-turbospin__text--on">on</span>
          </button>
        </div>
      </div>
      <div class="wild-heist-popup__bottom wild-heist-popup-bottom">
        <div class="wild-heist-popup-bottom__btns">

          <!-- открывает доп настройки -->
          <button
              class="wild-heist-popup-btn"
          >
            <span class="wild-heist-popup-btn__text wild-heist-popup-btn__text--gold">Дополнительно</span>
          </button>

          <!-- начать турбоспин -->
          <button
            @click="emit('auto')"
              class="wild-heist-popup-btn wild-heist-popup-btn--gold"
          >
            <span class="wild-heist-popup-btn__text">Начать автоигру</span>
          </button>
        </div>
        <div class="wild-heist-popup-bottom__controls">
          <ControlBtns
            :metrics = "{
              y: 1360,
              width: 275,
              height: 50,
              balanceX: 140,
              betX: 560,
              winX: 975,
            }"
            :balance="balance"
            :bet="bet"
            :win="win"
            :currencyCode="currencyCode"
            :isLTRTextDirection="isLTRTextDirection"
            :isBetExpected="isBetExpected"
            :isSpinExpected="isSpinExpected"
            @balance="emit('balance')"
            @bet="emit('bet')"

          />
        </div>
      </div>
    </div>
</template>


<style scoped>
  .wild-heist-popup--autogame {
    width: 1300px;
  }
</style>
