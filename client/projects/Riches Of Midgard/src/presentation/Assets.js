import { Assets } from "pixi.js"
let commonResources = {}

function spreadWrappedTextures(resources) {
	for (const {textures} of Object.values(resources))
		if (textures)
			for (const [name, texture] of Object.entries(textures))
				resources[name] = texture

	return resources
}

export async function getPreloadingResources() {
	Assets.addBundle('preloading', {
		loading_background: 'jpg/loading_background.jpg',
		preloading_elements: 'atlases/preloading_elements.json',
		runes:  'fonts/runes.ttf',
	})

	commonResources = spreadWrappedTextures(await Assets.loadBundle('preloading'))

	return commonResources
}

export async function getResources(onProgressCallback) {
	Assets.addBundle('gameAssets', {
		// ATLASES...
		symbols: 'atlases/symbols.json',
		reels_elements: 'atlases/reels_elements.json',
		teaser_elements: 'atlases/teaser_elements.json',
		elements: 'atlases/elements.json',
		// ...ATLASES

		// JPG...
		background_tile: 'jpg/background_tile.jpg',
		// ...JPG
	})

	const resources = spreadWrappedTextures(
		await Assets.loadBundle('gameAssets', onProgressCallback))

	return {...commonResources, ...resources}
}
