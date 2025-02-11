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
	})

	commonAssets = spreadWrappedTextures(
		await Assets.loadBundle('preloading'))

	return commonAssets
}

export async function getAssets(onProgressCallback) {  
	Assets.addBundle('gameAssets', {
		elements: 'atlases/elements.json',
	})

	const assets = spreadWrappedTextures(
		await Assets.loadBundle('gameAssets', onProgressCallback))

	return {...commonAssets, ...assets}
}
