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
		preloading_elements: 'atlases/preloading_elements.json',
		default: 'fonts/default.otf'
	})

	commonResources = spreadWrappedTextures(
		await Assets.loadBundle('preloading'))

	return commonResources
}

export async function getResources(onProgressCallback) {    
	Assets.addBundle('gameAssets', {
		// ATLASES...
		elements: 'atlases/elements.json',
		lines: 'atlases/lines.json',
		// ...ATLASES

		// JPG...
		background_default_game: 'jpg/background_default_game.jpg',
		background_hat: 'jpg/background_hat.jpg',
		// ...JPG
	})

	const resources = spreadWrappedTextures(
		await Assets.loadBundle('gameAssets', onProgressCallback))

	return {...commonResources, ...resources}
}
