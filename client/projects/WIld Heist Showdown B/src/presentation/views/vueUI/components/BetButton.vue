<script setup>
  import TextField from '../components/TextField.vue'
</script>

<template>
  <button
      class="wild-heist-bet"
  >
    <TextField>
      <span class="wild-heist-bet__text">128 688 USD</span>
    </TextField>
  </button>
</template>

<style lang="scss" scoped>
  .wild-heist-bet {
    background: hsla(13, 43%, 8%, 0.7);
  }
</style>