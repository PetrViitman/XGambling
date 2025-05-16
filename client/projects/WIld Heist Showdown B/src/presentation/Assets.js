import { Assets, Spritesheet } from "pixi.js"
import { TextureAtlas } from '@pixi-spine/base';
import { AtlasAttachmentLoader, SkeletonJson } from '@pixi-spine/runtime-4.1';
import { SPINE_SKELETON_DATA } from "./SpineDatas";
import { SPINE_ATLAS_DATA } from "./SpineAtlases";
import { ATLAS_DATA } from "./Alases";

async function createSpineFromRawData(imagePath, jsonData, atlasText) {
	const texture = await Assets.load(imagePath)
	const spineAtlas = new TextureAtlas(atlasText, (line, callback) => {
		callback(texture);
	})
	const atlasLoader = new AtlasAttachmentLoader(spineAtlas)
	const skeletonJson = new SkeletonJson(atlasLoader)
	const spineData = skeletonJson.readSkeletonData(jsonData)

	return spineData
}

let commonAssets = {}

function spreadWrappedTextures(resources) {
	if(!resources)
	console.log('spreadWrappedTextures: ', resources)
	for (const resource of Object.values(resources))
		if (resource?.textures)
			for (const [name, texture] of Object.entries(resource.textures))
				resources[name] = texture

	return resources
}

export async function getPreloadingAssets(
	assetsMap = {
		preloading_screen:  './preloading/preloading_screen.jpg'
	}
) {
	Assets.addBundle('preloading', assetsMap)

	commonAssets = spreadWrappedTextures(await Assets.loadBundle('preloading'))

	return commonAssets
}


export async function getAssets(
	assetsMap = {
		spines: {
			button: './spines/button.png',
			a: './spines/a.png',
			j: './spines/j.png',	
			k: './spines/k.png',
			q: './spines/q.png',
			bottle: './spines/bottle.png',
			boy: './spines/boy.png',
			gun: './spines/gun.png',
			hat: './spines/hat.png',
			scatter: './spines/scatter.png',
			wild: './spines/wild.png',
			explosion_bottom: './spines/explosion_bottom.png',
			explosion_up: './spines/explosion_up.png',
			glow: './spines/glow.png',
			popup: './spines/popup.png',
			coins: './spines/coins.png',
			info_up: './spines/info_up.png',
			info_bottom: './spines/info_bottom.png',
		},
		elements: './atlases/elements@0.5x.png',
		jpgs: './atlases/jpgs@0.5x.jpg',
		fontURLS: [
			'VUI/fonts/Roboto-Bold.woff2',
			'VUI/fonts/Roboto-Bold.woff',
			'VUI/fonts/Roboto-Bold.svg',
			'VUI/fonts/Roboto-Regular.woff2',
			'VUI/fonts/Roboto-Regular.woff',
			'VUI/fonts/Roboto-Regular.woff',
			'VUI/fonts/Roboto-Regular.svg',
			'VUI/fonts/Roboto-Medium.woff2',
			'VUI/fonts/Roboto-Medium.woff',
			'VUI/fonts/Roboto-Medium.svg',
			'VUI/fonts/Roboto-SemiBold.woff2',
			'VUI/fonts/Roboto-SemiBold.woff',
			'VUI/fonts/Roboto-SemiBold.svg'
		],
		VUI: {
			'autoplay-btn-circle': './VUI/autoplay-btn-circle.png',
			'bet-control-btn': './VUI/bet-control-btn.png',
			'btn-bonus-png': './VUI/btn-bonus.png',
			'btn-bonus-webp': './VUI/btn-bonus.webp',
			'btn-close': './VUI/btn-close.png',
			'circle': './VUI/circle.png',
			'factor-png': './VUI/factor.png',
			'factor-webp': './VUI/factor.webp',
			'paytable-icons-sprite': './VUI/paytable-icons-sprite.png',
			'question': './VUI/question.png',
			'scatter': './VUI/scatter.png',
			'win-comb-png': './VUI/win-comb.png',
			'win-comb-webp': './VUI/win-comb.webp',
		}
	}) {

	for (const [key, path] of  Object.entries(assetsMap.VUI)) {
		document.documentElement.style.setProperty('--' + key, 'url(' + path +')')
	}

	delete assetsMap.VUI

	const finalSpineData = {}

	for (const [key, path] of  Object.entries(assetsMap.spines)) {
		finalSpineData[key] = await createSpineFromRawData(
			path,
			SPINE_SKELETON_DATA[key],
			SPINE_ATLAS_DATA[key],
		)
	}

	delete assetsMap.spines
	Assets.addBundle('game_assets', assetsMap)

	commonAssets = spreadWrappedTextures(await Assets.loadBundle('game_assets'))
	const spriteSheetElements = new Spritesheet(
		commonAssets.elements,
		ATLAS_DATA.elements
	)

	console.log('spriteSheetElements created...')

	await spriteSheetElements.parse()

	const spriteSheetJpgs = new Spritesheet(
		commonAssets.jpgs,
		ATLAS_DATA.jpgs
	)

	await spriteSheetJpgs.parse()


	for (const [key, spineData] of  Object.entries(finalSpineData)) {
		commonAssets[key] = spineData
	}

	commonAssets = {
		...commonAssets,
		...spriteSheetElements.textures,
		...spriteSheetJpgs.textures
	}


	const {fontURLS} = assetsMap
	const style = document.createElement("style");
	style.type = "text/css";
	style.textContent = `
	@font-face {
		font-family: 'Roboto';
		src: url('${fontURLS[0]}') format('woff2'),
		url('${fontURLS[1]}') format('woff'),
		url('${fontURLS[2]}#Roboto-Bold') format('svg');
		font-weight: bold;
		font-style: normal;
		font-display: swap;
	}

	@font-face {
		font-family: 'Roboto';
		src: url('${fontURLS[3]}') format('woff2'),
		url('${fontURLS[4]}') format('woff'),
		url('${fontURLS[5]}#Roboto-Regular') format('svg');
		font-weight: 400;
		font-style: normal;
		font-display: swap;
	}

	@font-face {
		font-family: 'Roboto';
		src: url('${fontURLS[6]}') format('woff2'),
		url('${fontURLS[7]}') format('woff'),
		url('${fontURLS[8]}#Roboto-Medium') format('svg');
		font-weight: 500;
		font-style: normal;
		font-display: swap;
	}

	@font-face {
		font-family: 'Roboto';
		src: url('${fontURLS[9]}') format('woff2'),
		url('${fontURLS[10]}') format('woff'),
		url('${fontURLS[11]}#Roboto-SemiBold') format('svg');
		font-weight: 600;
		font-style: normal;
		font-display: swap;
	}
	`;

	document.head.appendChild(style);


	return commonAssets
}
