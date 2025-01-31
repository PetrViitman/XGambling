<script setup>
	import Selector from '../Selector.vue';
	import TextField from '../TextField.vue'
	import { ref } from 'vue'

	const selectedIndex = ref(0)
	const selectedIndex2 = ref(0)
	const emit = defineEmits(['confirm', 'close', 'selected', 'selected2'])
	const props =  defineProps({
		isSimplifiedMode: Boolean,
		messageText: String,
		buttonText: String,

		selectorIndex: Number,
		selectorCaptionText: String,
		selectableValues: Array,
		selectableCaptionValues: {
			type: Array,
			default: []
		},

		selectorIndex2: Number,
		selectorCaptionText2: String,
		selectableValues2: Array,
		selectableCaptionValues2: {
			type: Array,
			default: []
		},
	})

	const selector = ref(null)
	const selector2 = ref(null)

	function onValueSelected(index) {
		selectedIndex.value = index
		emit('selected', index)
	}

	function onValue2Selected(index) {
		selectedIndex2.value = index
		emit('selected2', index)
	}

	function setSelectedIndex(value) {
		selectedIndex.value = value ?? 0
		selector.value.setSelectedIndex(value)
	}

	function setSelectedIndex2(value) {
		selectedIndex2.value = value ?? 0
		selector2.value.setSelectedIndex(value)
	}

	defineExpose({ setSelectedIndex, setSelectedIndex2 })
</script>

<template>
	<div>
		<div class="body-background"> </div>
		<TextField
			class="message-text"
			:class="{ centralHeader: !selectableValues2 }"
			:maximalWidth="selectableValues2 ? 200 : 250"
			:maximalHeight="20"
			:layoutX="'center'"
			:layoutY="'middle'">
			{{ messageText }}
		</TextField>
		<TextField
			@click="emit('confirm', selectedIndex)"
			class="button"
			:maximalWidth="110"
			:maximalHeight="30"
			:layoutX="'center'"
			:layoutY="'middle'"
			:padding="10">
			{{ buttonText }}
		</TextField>
		<Selector
			ref="selector"
			class="decorated selector"
			:class="{ centralSelector: !selectableValues2 }"
			@selected="(index) => onValueSelected(index)"
			:isDecorated = "!isSimplifiedMode"
			:width = "200"
			:textFieldWidth = "100"
			:selectableValues = "selectableValues"
			:captionText = "selectorCaptionText ?? selectableCaptionValues[selectedIndex]">
		</Selector>

		<Selector
			v-if="selectableValues2"
			ref="selector2"
			class="decorated selector2"
			@selected="(index) => onValue2Selected(index)"
			:isDecorated = "!isSimplifiedMode"
			:width = "200"
			:textFieldWidth = "100"
			:selectableValues = "selectableValues2"
			:captionText = "selectorCaptionText2 ?? selectableCaptionValues2[selectedIndex]">
		</Selector>
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
		width: 250px;
		height: 20px;
		left: 50px;
		top: 15px;
		text-align: center;
	}

	.selector{
		top: 50px;
		left: 50px;
	}
	.selector2{
		top: 110px;
		left: 50px;
	}

	.button {
		position: absolute;
		left: 97px;
		top: 175px;
		width: 110px;
		height: 30px;
		background:#b3b3b3;
		border-radius: 10px;
		color: black;
	}

	.button:hover {
		background:#00B1A9;
		cursor: pointer;
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

	.centralHeader {
		left: 25px;
		top: 45px;
	}
	.centralSelector {
		top: 90px;
	}

</style>