<script setup>
	import TextField from './TextField.vue'
	const props = defineProps({
		text: String,
        default: '-'
	})
</script>

<template scoped>
    <TextField
        class="text-field"
        :layoutX="'center'"
        :layoutY="'middle'"
        :maximalWidth = "400"
        :maximalHeight = "100">
        {{ text }}
    </TextField>
</template>

<style scoped>
	.text-field{
		opacity: 0.5;
        color: rgb(200, 255, 0);
        font-weight: normal;
	}
</style>
