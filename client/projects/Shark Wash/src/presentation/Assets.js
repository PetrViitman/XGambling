import 'pixi-spine'
import { Assets } from "pixi.js"
let commonResources = {}

function spreadWrappedTextures(resources) {
	for (const {textures} of Object.values(resources))
		if (textures)
			for (const [name, texture] of Object.entries(textures))
				resources[name] = texture

	return resources
}


export async function getPreloadingAssets() {
	Assets.addBundle('preloading', {
		loading_background: 'jpg/loading_background.jpg',
		preloading_elements: 'atlases/preloading_elements.json',
		default:  'fonts/default.otf',
	})

	commonResources = spreadWrappedTextures(
		await Assets.loadBundle('preloading'))

	return commonResources
}

export async function getAssets(onProgressCallback) {    
	Assets.addBundle('gameAssets', {
		// SPINES...
		H1: 'spines/H1@2x.json',
		H2: 'spines/H2@2x.json',
		H3: 'spines/H3@2x.json',
		H4: 'spines/H4@2x.json',
		L1: 'spines/L1@2x.json',
		L2: 'spines/L2@2x.json',
		L3: 'spines/L3@2x.json',
		L4: 'spines/L4@2x.json',
		SC: 'spines/SC@2x.json',
		WR: 'spines/WR@2x.json',
		bonus_mode_splash: 'spines/Intro@2x.json',
		bonus_payout_splash: 'spines/outro@2x.json',
		bubbles: 'spines/bubbles@2x.json',
		bubble_multiplier: 'spines/bubble_multiplier@2x.json',
		big_win: 'spines/win_feedback@2x.json',
		// ...SPINES
	
		// ATLASES...
		wild_elements: 'atlases/wild_elements.json',
		bonus_reels_elements: 'atlases/bonus_reels_elements.json',
		bright_blue_elements:'atlases/bright_blue_elements.json',
		colorless_elements: 'atlases/colorless_elements.json',
		default_reels_elements: 'atlases/default_reels_elements.json',
		multiplier_elements: 'atlases/multiplier_elements.json',
		teaser_elements:'atlases/teaser_elements.json',
		wild_elements: 'atlases/wild_elements.json',
		yellow_elements: 'atlases/yellow_elements.json',
		elements: 'atlases/elements.json',
		// ...ATLASES

		// JPG...
		background_tile: 'jpg/background_tile.jpg',
		background_free_spins: 'jpg/background_free_spins.jpg',
		// ...JPG
	})

	const resources = spreadWrappedTextures(
		await Assets.loadBundle('gameAssets', onProgressCallback))

	return {...commonResources, ...resources}
}
