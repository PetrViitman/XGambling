
<script setup>
  import { ref } from 'vue';
  import sprites from './SVGs'

  const props =  defineProps({
        spriteName: {
            type: String,
            required: true,
        }
  })

  const icon = ref(sprites[props.spriteName])
</script>

<template>
  <svg class="wild-heist-ico" v-html="icon"></svg>
</template>

<style>
  .test {
    color: aqua;
  }
</style>
