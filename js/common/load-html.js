function loadHTML(url, hasParent) {
	const thatCallingScript = document.currentScript;

	jQuery(document).ready(function () {
		let newElement;
		
		if (hasParent) {
			newElement = thatCallingScript.parentElement;
		}

		if (!newElement) {
			newElement = document.createElement("div");
			newElement.id = `loaded-html-${Date.now()}-${Math.floor(
				Math.random() * 69
			)}`;
			document.body.appendChild(newElement);
		}

		clearTimeout(window._setLoadedImportsTimeout);
    jQuery.get(url).done((response) => {
			jQuery(newElement).html(response);
			// console.info('attached', url);
			callLoadedImports();
    });
  });
}

function callLoadedImports() {
	clearTimeout(window._setLoadedImportsTimeout);
	window._setLoadedImportsTimeout = setTimeout(() => {
		document.dispatchEvent(new Event('imports-loaded'));
		// console.info("imports-loaded");
	}, 200)
}
