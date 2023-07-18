function loadHTML(url) {
  jQuery(document).ready(function () {
    const newElement = document.createElement("div");
    newElement.id = `loaded-html-${Date.now()}-${Math.floor(
      Math.random() * 69
    )}`;
    document.body.appendChild(newElement);

    jQuery.get(url).done((response) => {
      jQuery(newElement).html(response);
    });
  });
}
