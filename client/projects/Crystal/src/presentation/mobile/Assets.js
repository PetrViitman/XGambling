import { Assets } from "pixi.js"
const COMMON_PATH = './'
let commonAssets = {}

function spreadWrappedTextures(assets) {
	for (const {textures} of Object.values(assets))
		if (textures)
			for (const [name, texture] of Object.entries(textures))
				assets[name] = texture

	return assets
}


export async function getPreloadingAssets() {
	Assets.addBundle('preloading', {
		preloading_elements: 'atlases/preloading_elements.json',
		egypt: 'fonts/egypt.otf',
	})

	commonAssets = spreadWrappedTextures(
		await Assets.loadBundle('preloading'))

	return commonAssets
}

export async function getAssets(onProgressCallback) {	
	Assets.addBundle('gameAssets', {
		// ATLASES...
		elements: COMMON_PATH + 'atlases/elements.json',
		crystals: COMMON_PATH + 'atlases/crystals.json',
		// ...ATLASES

		// SPINE...
		big_win: 'spines/bubble.json',
		logo: 'spines/logo.json',
		king: 'spines/king.json',
		bg_fx: 'spines/bg_fx.json',
		thief: 'spines/thief.json',
		mouse_and_traps: 'spines/mouse_and_traps.json',
		// ...SPINE

		// JPG...
		background_desktop: 'jpg/background_desktop.jpg',
		// ...JPG
	})

	const assets = spreadWrappedTextures(
		await Assets.loadBundle('gameAssets', onProgressCallback))

	return {...commonAssets, ...assets}
}
