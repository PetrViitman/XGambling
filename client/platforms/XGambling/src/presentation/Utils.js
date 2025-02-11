import { Graphics } from "pixi.js";

export function formatMoney({value, currencyCode, isLTRTextDirection = true}) {
	let formattedValue = value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,').split(",").join(" ")

	if(currencyCode) {
		if (isLTRTextDirection) {
			formattedValue = formattedValue + ' ' + currencyCode
		} else {
			formattedValue = currencyCode + ' ' + formattedValue
		}
	}

	return formattedValue
}

export function getDefaultLocale() {
	if (navigator.languages != undefined) 
	  return navigator.languages[0]; 
	return navigator.language;
}


export function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
export function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

export function isTouchScreen() {
	return 'ontouchstart' in window
			|| navigator.maxTouchPoints > 0 
			|| navigator.msMaxTouchPoints > 0
}

export function flipObject(object) {
    const flippedObject = {}
    Object.keys(object).forEach((key) => flippedObject[object[key]]=key);

    return flippedObject
}

export function setFavicon(url) {
    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = url
}

export function setBrowserCookie(name, value, days = 365) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
export function getBrowserCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}




export function brightnessToHexColor(brightness) {
	if (Number.isNaN(brightness)) {
		return 0xFFFFFF
	}
	let hex = Math.trunc(255 * Math.min(1, Math.max(0, brightness))).toString(16)
	if (hex.length === 1) { hex = '0' + hex }

	return parseInt('0x' + hex + hex + hex, 16)
}

function chanelToHex(chanelValue) {
	let hex = Math.trunc(255 * Math.min(1, Math.max(0, chanelValue))).toString(16)
	if (hex.length === 1) hex = '0' + hex

	return hex + ''
}

export function toHexColor(red, green, blue) {
	const redHex = chanelToHex(red)
	const greenHex = chanelToHex(green)
	const blueHex = chanelToHex(blue)
	
	return parseInt('0x' + redHex + greenHex + blueHex, 16)
}

export function brightenColor(red, green, blue, brightness) {
	const redHex = chanelToHex(Math.min(1, red * brightness))
	const greenHex = chanelToHex(Math.min(1, green * brightness))
	const blueHex = chanelToHex(Math.min(1, blue * brightness))

	return parseInt('0x' + redHex + greenHex + blueHex, 16)
}

export function colorToColor(red1, green1, blue1, red2, green2, blue2, progress) {
	const deltaRed = red2 - red1
	const deltaGreen = green2 - green1
	const deltaBlue = blue2 - blue1

	return toHexColor(
		(red1 + deltaRed * progress) / 255,
		(green1 + deltaGreen * progress) / 255,
		(blue1 + deltaBlue * progress) / 255
	)
}

export function getGradient({
	width = 123,
	height = 123,
	color = 0xFFFFFF,
}) {
	const halfWidth = width / 2
	const alphaStep = 1 / halfWidth
	const graphics = new Graphics()

	let alpha = alphaStep

	for (let x = 0; x < halfWidth; x++) {
		alpha = Math.min(1, alpha + alphaStep)
		graphics
			.beginFill(color, alpha)
			.drawRect(x, 0, 1, height)
	}

	graphics.endFill()
	graphics.cacheAsBitmap = true
	graphics.pivot.set(halfWidth, height / 2)

	return graphics
}