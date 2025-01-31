<script setup>
	import TextField from '../TextField.vue'
	import { ref } from 'vue'
	import {REELS_COUNT, CELLS_PER_REEL_COUNT} from '../../../../Constants'
	const emit = defineEmits(['confirm', 'close'])
	const reels = new Array(REELS_COUNT)
		.fill(0)
		.map((reel, x) => new Array(CELLS_PER_REEL_COUNT).fill(2))

	const reelsCount = ref(REELS_COUNT)
	const reelsLengths = ref([0, 7, 7, 7, 7, 7, 7, 7])
	function changeSymbolId({e, x, y}) {
		const { options } = e.target
		const index = Number(options[options.selectedIndex].value)
		reels[x][y] = index
	}

	function changeSpecialSymbolId(e) {
		const { options } = e.target
		specialSymbolId = Number(options[options.selectedIndex].value)
		if (specialSymbolId === -1) specialSymbolId = undefined
	}

	function changeKeyOption(e) {
		const { options } = e.target
		keyId = Number(options[options.selectedIndex].value)
		if (keyId === -1) specialSymbolId = undefined
	}

	function confirm() {
		emit('confirm', {reels})
	}

	const props =  defineProps({
		messageText: String,
		instructionText: String,
		buttonText: String,
   })
</script>

<template>
	<div>
		<div class="body-background"> </div>
		<TextField
			class="message-text"
			:maximalWidth="220"
			:maximalHeight="20"
			:layoutX="'center'"
			:layoutY="'middle'">
			{{ messageText }}
		</TextField>


		<div class="reels">
			<div v-for="x in reelsCount + 1" 
				:class="{ 'symbol-selector-column': true }"
				:style="{ top: 0 + 'px'}"
			>
				<select v-for="y in reelsLengths[x]"
					@change="e => changeSymbolId({
						e,
						x: x - 1,
						y: y - 1})"
					name="symbols"
					:class="{
						'symbol-selector': true,
					}">
					<option value="2" selected="selected" >🟥</option>
					<option value="3">🟪</option>
					<option value="4">🟩</option>
					<option value="5">🟨</option>
					<option value="6">💎</option>
					<option value="7">🟦</option>
					<option v-if="x > 1" value="1">👑</option>
				</select>
			</div>
		</div>
		<TextField
			class="instruction-text"
			:maximalWidth="220"
			:maximalHeight="20"
			:layoutX="'center'"
			:layoutY="'middle'">
			{{ instructionText }}
		</TextField>
				
		<TextField
			@click="confirm()"
			class="button"
			:maximalWidth="120"
			:maximalHeight="20"
			:layoutX="'center'"
			:layoutY="'middle'">
			{{ buttonText }}
		</TextField>
		<div
			@click="emit('close')"
			class="button-close">
			✕
		</div>
	</div>
</template>

<style scoped>
.body-background{
	width: 300px;
	height: 225px;
	border-radius: 15px;
	background: -webkit-gradient(linear, left bottom, left top, from(rgba(0, 0, 0, .8)), to(rgba(41, 41, 41, .8)));
	background: linear-gradient(to top, rgba(0, 0, 0, .8) 0%, rgba(41, 41, 41, .8) 100%);
	border-top: 1px solid #515253;
	-webkit-backdrop-filter: blur(3px);
	backdrop-filter: blur(3px);
}

.message-text {
	width: 220px;
	height: 20px;
	left: 41px;
	top: 15px;
	text-align: center;
}

.instruction-text {
	width: 300px;
	height: 20px;
	left: 40px;
	top: 33px;
	text-align: center;
	font-size: 12px;
}

.button {
	position: absolute;
	left: 90px;
	top: 190px;
	width: 120px;
	height: 20px;
	background:#b3b3b3;
	border-radius: 5px;
	color: black;
	font-size: 10px;
}

.button:hover {
	background:#00B1A9;
	cursor: pointer;
}

select {
	width: 35px;
	height: 25px;
	background-color: black;
	color: white;
	border-radius: 5px;
	border-width: 0px;
	font-size: 15px;
	-webkit-appearance: none;
	-moz-appearance: none;
	text-indent: 1px;
	text-overflow: '';
	outline: none;
	text-align: center;
}

option {
	background-color: black;
}

select:hover {
	cursor: pointer;
	background-color: #515253;   
}

.reels {
	position: absolute;
	top: 51px;
	left: 59px;
}

.button-close{
	border-top: 1px solid #515253;
	top: 5px;
	right: 5px;
	text-align: center;
	width: 25px;
	height: 25px;
	font-size: 17px;
	background-color: rgba(255, 255, 255, 0.1);
	border-radius: 15px;
	position: absolute;
}

.button-close.disabled{
	pointer-events: none;
	opacity: 0.5;
}

.button-close:hover {
	border-top: 1px solid white;
	color: white;
	cursor: pointer;
	background-color: rgba(255, 255, 255, 0.25);
}

.hidden {
	opacity: 0;
	pointer-events: none;
}

.symbol-selector {
	width: 100%;
	height: 18px
}

.symbol-selector-column {
	width: 26px;
	display: inline-block;
	position: relative;
}

</style>