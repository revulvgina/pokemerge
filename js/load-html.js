function loadHTML(url, toElementSelector) {
	jQuery(document).ready(function () {
		let newElement;

		let didElementExist = false;

		if ('string' === typeof toElementSelector && toElementSelector.trim().length) {
			newElement = jQuery(toElementSelector);
			didElementExist = true;
		}

		if (!newElement) {
			newElement = document.createElement("div");
			newElement.id = `loaded-html-${Date.now()}-${Math.floor(
				Math.random() * 69
			)}`;
			document.body.appendChild(newElement);

			didElementExist = false;
		}

    jQuery.get(url).done((response) => {
			jQuery(newElement).html(response);
    });
  });
}
