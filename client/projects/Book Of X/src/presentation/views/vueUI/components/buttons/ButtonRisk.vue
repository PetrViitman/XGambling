<script setup>
	import TextField from '../TextField.vue'
	const emit = defineEmits(['selected'])
</script>

<template>
	<div class="body">
		<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" version="1.1" x="0" y="0" viewBox="0 0 300 300" xml:space="preserve" style="transform: scale(2);"><g class="svg-group enable-pointer-events"><g id="buy1-idle"><linearGradient id="SVGID_00000018917514385081400190000014233472865120443070_" x1="151.979" x2="147.889" y1="2406.465" y2="2566.673" gradientTransform="translate(0 -2334)" gradientUnits="userSpaceOnUse"><stop offset="0.162"
			stop-color="#474747"></stop><stop offset="0.467"
			stop-color="#383838"></stop><stop offset="0.533"
			stop-color="#303030"></stop><stop offset="0.715"
			stop-color="#1F1F1F"></stop><stop offset="0.85"
			stop-color="#191919"></stop></linearGradient><rect y="117.5" width="153" height="65" rx="32.5" ry="32.5" class="bf-out-rect"
			fill="url(#SVGID_00000018917514385081400190000014233472865120443070_)" x="73.5"></rect><linearGradient id="SVGID_00000048496014119142423940000007285476328273322148_" x1="153.005" x2="147.264" y1="-2258.757" y2="-2112.497" gradientTransform="matrix(1 0 0 -1 0 -2032.2)" gradientUnits="userSpaceOnUse"><stop offset="0"
			stop-color="#424242"></stop><stop offset="0.248"
			stop-color="#434343"></stop><stop offset="0.674"
			stop-color="#161616"></stop><stop offset="0.927"></stop></linearGradient><rect y="120.5" width="147" height="59" rx="32.5" ry="32.5" class="bf-in-rect"
			fill="url(#SVGID_00000048496014119142423940000007285476328273322148_)" x="76.5"></rect></g><g class="bf-buy-text-wrapper" style="transform: translate(139px, 161px) scale(0.5);"><g x="0" y="0">
			</g>
			</g>
			</g>
	 	</svg>
		<TextField
			class="text-field blink"
			:layoutX="'center'"
			:layoutY="'middle'"
			:maximalWidth = 150
			:maximalHeight = 60
			@click="emit('selected')"
			>
		  <slot></slot>
		</TextField>
	</div>
</template>

<style scoped>
	.body{
		width: 150px;
		height: 65px;
		pointer-events: none;
	}
	.svg-icon {
		width: 150px;
		height: 150px;
		position: absolute;
		left: 0px;
		top: -45px;
	}
	.text-field:hover {
		color: white;
		cursor: pointer;
		-webkit-animation: 1;
		opacity: 1;
	}
	.text-field {
		width: 150px;
		height: 65px;
		overflow: hidden;
		pointer-events: auto;
		position: absolute;
		top: 0px;
		left: 0px;
		opacity: 0.5;
	}

	.blink {
    -webkit-animation: blink 2s infinite both;
            animation: blink 2s infinite both;
	}

	@-webkit-keyframes blink {
	0%,
	50%,
	100% {
		opacity: 1;
		}
		25%,
		75% {
			opacity: 0;
		}
	}
	@keyframes blink {
		0%,
		50%,
		100% {
			opacity: 1;
		}
		25%,
		75% {
			opacity: 0;
		}
	}

	.glow {
		color: #fff;
		text-align: center;
		-webkit-animation: glow 1s ease-in-out infinite alternate;
		-moz-animation: glow 1s ease-in-out infinite alternate;
		animation: glow 1s ease-in-out infinite alternate;
		}

		@-webkit-keyframes glow {
		from {
			text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #e60073, 0 0 40px #e60073, 0 0 50px #e60073, 0 0 60px #e60073, 0 0 70px #e60073;
		}
		to {
			text-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;
		}
	}
</style>