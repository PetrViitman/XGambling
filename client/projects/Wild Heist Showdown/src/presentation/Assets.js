import { Assets, BaseTexture, Spritesheet, Texture } from "pixi.js"
import sound from 'pixi-sound';
let commonAssets = {}

function isWebpSupported() {
	const element = document.createElement('canvas');

	if (!!(element.getContext && element.getContext('2d'))) {
		return element.toDataURL('image/webp').indexOf('data:image/webp') == 0;
	} else {
		return false;
	}
}

const IS_WEBP_SUPPORTED = isWebpSupported()

async function fetchUncompressedTexture(path) {
	const imageHtmlElement = new Image()
	imageHtmlElement.crossOrigin = "anonymous";

	await new Promise(resolve => {
		imageHtmlElement.src = path
		imageHtmlElement.onload = resolve
	})

	

	const baseTexture = new BaseTexture(imageHtmlElement)

    return new Texture(baseTexture);
}

async function fetchUncompressedAtlas({
    pathToImage,
    pathToJson,
	textureResolution = 1
}) {
    const texture = await fetchUncompressedTexture(pathToImage);
    const request = new XMLHttpRequest()
    request.open('GET', pathToJson, true)
    request.overrideMimeType('application/json')
    request.send("")

	const response = await new Promise(resolve => {
		request.onreadystatechange = () => {
			if (request.readyState === 4) {
				resolve(request.response);
			}
		}
	})


    const jsonData = JSON.parse(response);
    const spriteSheet = new Spritesheet(
        texture,
        jsonData,
		'@' + textureResolution + 'x'
    );
    await spriteSheet.parse()

    return spriteSheet.textures;
}

async function  fetchAtlas(atlases, vfxLevel = 1) {

	const finalVfxLevel = Math.max(vfxLevel, 0.1)
	const additionalResolution = Math.min(1, finalVfxLevel / 0.45) * 0.6
	const textureResolution = Math.trunc((0.4 + additionalResolution) * 10) * 0.1
	const textureLevel = Math.trunc(additionalResolution / 0.6 * 6)
	const textureIndex = 6 - textureLevel
	const descriptor = atlases[textureIndex]

	const {
		pathToJson,
		pathToImage,
		isPathResolutionRequired = true
	} = descriptor

	const finalPathToJson = isPathResolutionRequired
		? await new URL(pathToJson, import.meta.url).href
		: pathToJson
	const finalPathToImage = isPathResolutionRequired
		? await new URL(pathToImage, import.meta.url).href
		: pathToImage

	const texturesMap = await fetchUncompressedAtlas({
		pathToImage: finalPathToImage,
		pathToJson: finalPathToJson,
		textureResolution,
	})

	for (const [name, texture] of Object.entries(texturesMap)) {
		commonAssets[name] = texture
	}

	return commonAssets
}

export async function getPreloadingAssets(
	assetsMap = {
		atlases: [
			{
				pathToJson: 'atlases/preloading_elements.json',
				pathToImage: 'atlases/preloading_elements.upng',
				isPathResolutionRequired: false,
			},
		],
		atlasesAlt: [
			{
				pathToJson: 'atlases/preloading_elements.json',
				pathToImage: 'atlases/preloading_elements.alt',
				isPathResolutionRequired: false,
			},
		],
	},
) {
	const atlases = IS_WEBP_SUPPORTED ? assetsMap.atlases : assetsMap.atlasesAlt
	await fetchAtlas(atlases, 1)

	return commonAssets
}

export async function getAssets(
	assetsMap = {
		audio: {
			music: './audio/music.ogg'
		},
		atlases: [
			{
				pathToJson: 'atlases/elements_0.json',
				pathToImage: 'atlases/elements_0.upng',
				isPathResolutionRequired: false,
			},
			{
				pathToJson: 'atlases/elements_1.json',
				pathToImage: 'atlases/elements_1.upng',
				isPathResolutionRequired: false,
			},
			{
				pathToJson: 'atlases/elements_2.json',
				pathToImage: 'atlases/elements_2.upng',
				isPathResolutionRequired: false,
			},
			{
				pathToJson: 'atlases/elements_3.json',
				pathToImage: 'atlases/elements_3.upng',
				isPathResolutionRequired: false,
			},
			{
				pathToJson: 'atlases/elements_4.json',
				pathToImage: 'atlases/elements_4.upng',
				isPathResolutionRequired: false,
			},
			{
				pathToJson: 'atlases/elements_5.json',
				pathToImage: 'atlases/elements_5.upng',
				isPathResolutionRequired: false,
			}
		],
		atlasesAlt: [
			{
				pathToJson: 'atlases/elements_0.json',
				pathToImage: 'atlases/elements_0.alt',
				isPathResolutionRequired: false,
			},
			{
				pathToJson: 'atlases/elements_1.json',
				pathToImage: 'atlases/elements_1.alt',
				isPathResolutionRequired: false,
			},
			{
				pathToJson: 'atlases/elements_2.json',
				pathToImage: 'atlases/elements_2.alt',
				isPathResolutionRequired: false,
			},
			{
				pathToJson: 'atlases/elements_3.json',
				pathToImage: 'atlases/elements_3.alt',
				isPathResolutionRequired: false,
			},
			{
				pathToJson: 'atlases/elements_4.json',
				pathToImage: 'atlases/elements_4.alt',
				isPathResolutionRequired: false,
			},
			{
				pathToJson: 'atlases/elements_5.json',
				pathToImage: 'atlases/elements_5.alt',
				isPathResolutionRequired: false,
			}
		],
	},
	vfxLevel = 1,
	onProgress
) {
	const atlases = IS_WEBP_SUPPORTED ? assetsMap.atlases : assetsMap.atlasesAlt
	await fetchAtlas(atlases, vfxLevel, onProgress)

	return commonAssets
}
