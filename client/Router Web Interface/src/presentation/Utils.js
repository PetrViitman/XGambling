
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
