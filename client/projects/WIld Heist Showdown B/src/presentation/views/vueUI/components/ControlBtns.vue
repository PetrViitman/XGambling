<script setup>
  import SVG from "./svg/SVG.vue";
  import TextField from './TextField.vue'
  import { formatMoney } from "../../../Utils";
  import { computed } from "vue";

  const props =  defineProps({
    betsOptions: Array,
    betIndex: Number,
    balance: Number,
		bet: Number,
		win: Number,
    currencyCode: String,
    isLTRTextDirection: Boolean,
    metrics: {
      type: Object,
      default: {
        y: 25,
        width: 275,
        height: 50,
        balanceX: 125,
        betX: 532,
        winX: 935,
        fontSize: 50,
      }
    }
  })

  const emit = defineEmits([
    'balance',
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

  const formattedBet = computed({
    get() {
      return formatMoney({
        value: props.bet,
        currencyCode: props.currencyCode,
        isLTRTextDirection: props.isLTRTextDirection
      })
    }
  })

  const formattedWin = computed({
    get() {
      const formattedMoney = formatMoney({
        value: props.win,
        currencyCode: props.currencyCode,
        isLTRTextDirection: props.isLTRTextDirection
      })

      if(!props.win || formattedMoney === '') return '-'

      return formattedMoney
    }
  })
</script>

<template>
  <!-- открывает попап баланса -->
  <button
      class="wild-heist-btn wild-heist-btn--has-bg"
      @click="emit('balance')"
  >
    <SVG
        :spriteName="'wallet'"
        width="60"
        height="60"
    />
    <span class="wild-heist-btn__text">
      <TextField
        class="balance"
        :maximalWidth="metrics.width"
        :maximalHeight="metrics.height"
        :layoutX="'center'"
        :layoutY="'middle'"
        >
        {{formattedBalance}}
      </TextField>
    </span>

  </button>

  <!-- открывает попап ставки -->
  <button
      class="wild-heist-btn wild-heist-btn--has-bg"
      @click="emit('bet')"
  >
    <SVG
        :spriteName="'money'"
        width="68"
        height="68"
    />
    <span class="wild-heist-btn__text">
      <TextField
        class="bet"
        :maximalWidth="metrics.width"
        :maximalHeight="metrics.height"
        :layoutX="'center'"
        :layoutY="'middle'"
        >
        {{ formattedBet }}
      </TextField>
    </span>
  </button>

  <!-- хз че делает, но зачем-то нужна))) -->
  <button
      class="wild-heist-btn wild-heist-btn--has-bg"
  >
    <SVG
        :spriteName="'arrow'"
        width="68"
        height="68"
    />
    <span class="wild-heist-btn__text">
      <TextField
        class="win"
        :maximalWidth="metrics.width"
        :maximalHeight="metrics.height"
        :layoutX="'center'"
        :layoutY="'middle'"
        >
        {{ formattedWin }}
      </TextField>
    </span>
  </button>
</template>

<style scoped>
  .balance {
    left: v-bind("metrics.balanceX + 'px'");
    top: v-bind("metrics.y + 'px'");
  }
  .bet {
    left: v-bind("metrics.betX + 'px'");
    top: v-bind("metrics.y + 'px'");
  }
  .win {
    left: v-bind("metrics.winX + 'px'");
    top: v-bind("metrics.y + 'px'");
  }
</style>
