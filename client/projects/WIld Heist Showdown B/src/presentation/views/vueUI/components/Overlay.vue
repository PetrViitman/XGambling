<script setup>
	const props =  defineProps({
		activePopupName: String,
	})
</script>

<template>
	<div class="body"> </div>
</template>

<style scoped>
.body{
	width: 100px;
	height: 100px;
	background-color: v-bind("activePopupName === 'paytable' ? '#30303b' : 'black'");
	opacity: v-bind("activePopupName === 'paytable' ? 1 : 0.6");
}
</style>