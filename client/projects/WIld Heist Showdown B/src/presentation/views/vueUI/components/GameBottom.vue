<script setup>
  import MenuButton from './MenuButton.vue'
  import SVG from './svg/SVG.vue'
  import ControlBtns from './ControlBtns.vue'
  import { ref } from 'vue'

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

  const emit = defineEmits([
    'selected',
    'autoplay',
    'balance',
    'bet'
  ])

  function betMore() {
		emit('selected', Math.min(props.betsOptions.length - 1, props.betIndex + 1))
	}

  function betLess() {
		emit('selected', Math.max(0, props.betIndex - 1))
	}

  function autoplay(spinsCount = 0) {
		emit('autoplay', spinsCount)
	}

  function paytable() {
    emit('paytable')
  }

  const menuLevel = ref(0)

  function toggleMenu() {
    menuLevel.value = (menuLevel.value + 1) % 2
  }
</script>

<template>
  <div v-show="!isSplashScreenMode" class="wild-heist__bottom wild-heist-bottom test">
    <div class="wild-heist-btns wild-heist__btns">
      <ControlBtns
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
    <div v-show="!isFreeSpinsMode && !isSplashScreenMode" class="wild-heist-controls wild-heist__controls">

      <!-- когда юзер заходит в игру, стартовый экран -->

        <MenuButton
            v-show="!menuLevel"
            class="wild-heist-btn--has-border"
            @click="toggleMenu"
        >
          <SVG
              :spriteName="'menu'"
              width="68"
              height="68"
          />
          <span class="wild-heist-btn__label">menu</span>
        </MenuButton>

        <button
          v-show="!menuLevel"
          :class="{disabled: !isSpinExpected || isFreeBet || betIndex === 0 }"
          class="wild-heist-btn wild-heist-btn--minus"
          @pointerdown="betLess"
        />

        <button
          v-show="!menuLevel"
          :class="{ disabled: !isSpinExpected || isFreeBet || betIndex === betsOptions.length - 1 }"
          class="wild-heist-btn wild-heist-btn--plus"
          @pointerdown="betMore"
        />

        <MenuButton
            v-show="!menuLevel"
            :class="{
              disabled:
              !isBetExpected
              || activeBonusDescriptor
              || !isSpinExpected
              || remainingAutoSpinsCount
            }"
            class="wild-heist-btn--has-border wild-heist-btn--autoplay"
            @click="autoplay()"
        >
          <SVG
              :spriteName="'play'"
              width="68"
              height="68"
          />
          <span class="wild-heist-btn__label">auto</span>
        </MenuButton>


      <!-- переход в меню -->

      <MenuButton
          v-show="menuLevel"
          class="wild-heist-btn--has-border"
          @click="toggleMenu"
      >
        <SVG
            :spriteName="'quit'"
            width="68"
            height="68"
        />
        <span class="wild-heist-btn__label">quit</span>
      </MenuButton>
      <MenuButton
          v-show="false"
          class="wild-heist-btn--has-border"
      >
        <!-- два темплейта для двух иконок звука (вкл/выкл) -->
          <SVG
              :spriteName="'sound'"
              width="68"
              height="68"
          />
        <!--
          <SVG
              :spriteName="'mute'"
              width="68"
              height="68"
          />
        -->

        <span class="wild-heist-btn__label">sound</span>
      </MenuButton>
      <MenuButton
          v-show="menuLevel"
          @click="paytable"
          class="wild-heist-btn--has-border"
      >
        <SVG
            :spriteName="'paytable'"
            width="68"
            height="68"
        />
        <span class="wild-heist-btn__label">paytable</span>
      </MenuButton>
      <MenuButton
          v-show="false"
          class="wild-heist-btn--has-border"
      >
        <SVG
            :spriteName="'rules'"
            width="68"
            height="68"
        />
        <span class="wild-heist-btn__label">rules</span>
      </MenuButton>
      <MenuButton
          v-show="false"
          class="wild-heist-btn--has-border"
      >
        <SVG
            :spriteName="'win'"
            width="68"
            height="68"
        />
        <span class="wild-heist-btn__label">history</span>
      </MenuButton>
      <MenuButton
          v-show="false"
          class="wild-heist-btn--has-border"
      >
        <SVG
            :spriteName="'close'"
            width="68"
            height="68"
        />
        <span class="wild-heist-btn__label">close</span>
      </MenuButton>
    </div>
  </div>
</template>

<style scoped>
  .test {
    width: 1250px;
    height: 0;
  }

  .wild-heist-controls {
    pointer-events: none;
    background: none;
  }

  .wild-heist-controls * {
    pointer-events: auto;
  }

  .disabled {
    opacity: 0.6;
    pointer-events: none;
  }
</style>

