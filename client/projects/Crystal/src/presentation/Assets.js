import { Assets } from "pixi.js"
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
		elements: 'atlases/elements.json',
		crystals: 'atlases/crystals.json',
		// ...ATLASES

		// SPINE...
		big_win: 'spines/bubble.json',
		// ...SPINE
	})

	const assets = spreadWrappedTextures(
		await Assets.loadBundle('gameAssets', onProgressCallback))

	return {...commonAssets, ...assets}
}
