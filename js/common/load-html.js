(() => {
	window.loadHTML = (url, hasParent) => {
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
			window._pendingElements += 1;
			jQuery.get(url).done((response) => {
				jQuery(newElement).html(response);
				window._pendingElements -= 1;
				// console.info('attached', url);
				0 === window._pendingElements && callLoadedImports();
			});
		});
	};
	
	const callLoadedImports = () => {
		clearTimeout(window._setLoadedImportsTimeout);
		window._setLoadedImportsTimeout = setTimeout(() => {
			document.dispatchEvent(new CustomEvent('imports-loaded'));
		}, 200)
	};

	window._pendingElements = 0;
})();
