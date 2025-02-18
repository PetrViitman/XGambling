import { Assets } from "pixi.js"

function getDefaultLocale() {
	if (navigator.languages != undefined) 
	  return navigator.languages[0]; 
	return navigator.language;
}

const RTL_LANGUAGE_CODES = ['ar', 'he', 'fa', 'ur', 'sd', 'ps', 'yi']
const FALLBACK_LANGUAGE_CODE = 'en'

async function getJsonData(path) {
    const text = await Assets.load({
		src: path,
		loadParser: 'loadTxt'
	})

    return JSON.parse(text)
}

export async function getDictionary(languageCode = getDefaultLocale()) {
    let dictionary = {}
    try { dictionary = await getJsonData('./translations/' + languageCode + '.json')}
    catch (error) {
        try { dictionary = await getJsonData('./translations/' + FALLBACK_LANGUAGE_CODE + '.json')} catch (error) {}
    }

	return {
        ...dictionary,
        isLTRTextDirection: !RTL_LANGUAGE_CODES.includes(languageCode)
    }
}