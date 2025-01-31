<script setup>
	import TextField from '../TextField.vue'
	const emit = defineEmits(['confirm', 'close'])
	const reels = [
		[1, 1, 1],
		[1, 1, 1],
		[1, 1, 1],
		[1, 1, 1],
		[1, 1, 1],
	]

	let riskOption
	let specialSymbolId

	function changeSymbolId({e, x, y}) {
		const { options } = e.target
		const index = Number(options[options.selectedIndex].value)
		reels[x][y] = index
	}

	function changeRiskOption(e) {
		const { options } = e.target
		riskOption = Number(options[options.selectedIndex].value)
		if (riskOption === -1) riskOption = undefined
	}

	function changeSpecialSymbolId(e) {
		const { options } = e.target
		specialSymbolId = Number(options[options.selectedIndex].value)
		if (specialSymbolId === -1) specialSymbolId = undefined
	}

	function confirm() {
		emit('confirm', {reels, riskOption, specialSymbolId})
	}

	const props =  defineProps({
		messageText: String,
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


		<select class="risk"
			@change="e => changeRiskOption(e)"
			name="symbols"
			:class="{
				'symbol-selector': true,
			}">
			<option value="-1" selected="selected" >❤️ ? ☘️</option>
			<option value="0">❤️</option>
			<option value="1">☘️</option>
		</select>

		<select class="specialSymbol"
			@change="e => changeSpecialSymbolId(e)"
			name="symbols"
			:class="{
				'symbol-selector': true,
			}">
			<option value="-1" selected="selected" >📖 ?</option>
			<option value="0">📖 10</option>
			<option value="1">📖 Q</option>
			<option value="2">📖 J</option>
			<option value="3">📖 A</option>
			<option value="4">📖 K</option>
			<option value="5">📖 🪲</option>
			<option value="6">📖 👁️‍🗨️</option>
			<option value="7">📖 ⚰️</option>
			<option value="8">📖 ☦️</option>
		</select>


		<div class="reels">
			<div v-for="y in 3">
				<select v-for="x in 5"
					@change="e => changeSymbolId({
						e,
						x: x - 1,
						y: y - 1})"
					name="symbols"
					:class="{
						'symbol-selector': true,
					}">
					<option value="0">10</option>
					<option value="1" selected="selected" >Q</option>
					<option value="2">J</option>
					<option value="3">A</option>
					<option value="4">K</option>
					<option value="5">🪲</option>
					<option value="6">👁️‍🗨️</option>
					<option value="7">⚰️</option>
					<option value="8">☦️</option>
					<option value="9">📖</option>
				</select>
			</div>
		</div>
		
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
	height: 200px;
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
	left: 40px;
	top: 15px;
	text-align: center;
}

.button {
	position: absolute;
	left: 95px;
	top: 165px;
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
	top: 70px;
	left: 65px;
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

.risk {
	position: absolute;
	left: 65px;
	top: 45px;

	font-size: 15px;
	width: 80px;
	height: 20px;
}

.specialSymbol {
	position: absolute;
	left: 160px;
	top: 45px;

	font-size: 15px;
	width: 80px;
	height: 20px;
}

.hidden {
	opacity: 0;
	pointer-events: none;
}

</style>